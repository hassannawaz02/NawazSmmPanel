const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, role } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          walletBalance: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    const userIds = users.map((u) => u.id);
    const spendingAgg = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _sum: { amount: true },
    });
    const spendingMap = {};
    spendingAgg.forEach((s) => {
      spendingMap[s.userId] = s._sum.amount || 0;
    });

    const usersWithSpending = users.map((u) => ({
      ...u,
      totalSpending: spendingMap[u.id] || 0,
    }));

    res.status(200).json({
      success: true,
      count: usersWithSpending.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: usersWithSpending,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const orderStats = await prisma.order.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { amount: true },
    });

    res.status(200).json({
      success: true,
      data: {
        ...user,
        orderStats: {
          totalOrders: orderStats._count.id || 0,
          totalSpent: orderStats._sum.amount || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, walletBalance } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!existingUser) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (walletBalance !== undefined && walletBalance !== existingUser.walletBalance) {
      const diff = walletBalance - existingUser.walletBalance;
      await prisma.walletTransaction.create({
        data: {
          userId: existingUser.id,
          type: diff > 0 ? 'credit' : 'debit',
          amount: Math.abs(diff),
          description: 'Balance adjustment by admin',
          balanceAfter: walletBalance,
          paymentMethod: 'manual',
          status: 'completed',
        },
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, username: req.body.username, email, role, isActive, walletBalance },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.id === req.user.id) {
      return next(new ErrorResponse('Cannot delete your own account', 400));
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    const processingOrders = await prisma.order.count({
      where: { status: { in: ['processing', 'in_progress'] } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });

    const revenueStats = await prisma.order.aggregate({
      where: { status: { notIn: ['cancelled', 'refunded'] } },
      _sum: { amount: true },
    });

    const todayRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        status: { notIn: ['cancelled', 'refunded'] },
      },
      _sum: { amount: true },
    });

    const profitStats = await prisma.order.aggregate({
      where: { status: { notIn: ['cancelled', 'refunded'] } },
      _sum: { profit: true },
    });

    const todayProfit = await prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        status: { notIn: ['cancelled', 'refunded'] },
      },
      _sum: { profit: true },
    });

    const totalServices = await prisma.service.count();
    const activeServices = await prisma.service.count({ where: { isActive: true } });

    const recentOrders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          today: todayOrders,
          byStatus: ordersByStatus.map((s) => ({ _id: s.status, count: s._count.id })),
        },
        revenue: {
          total: revenueStats._sum.amount || 0,
          today: todayRevenue._sum.amount || 0,
        },
        profit: {
          total: profitStats._sum.profit || 0,
          today: todayProfit._sum.profit || 0,
        },
        services: { total: totalServices, active: activeServices },
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};
