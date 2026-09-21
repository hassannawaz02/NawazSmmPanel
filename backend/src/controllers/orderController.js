const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');
const SMMProvider = require('../services/smmProvider');

exports.createOrder = async (req, res, next) => {
  try {
    const { serviceId, link, quantity } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    if (!service.isActive) {
      return next(new ErrorResponse('Service is not available', 400));
    }

    if (quantity < service.min || quantity > service.max) {
      return next(
        new ErrorResponse(
          `Quantity must be between ${service.min} and ${service.max}`,
          400
        )
      );
    }

    const isFixedPackage = service.min === service.max;
    const amount = isFixedPackage ? service.rate : (service.rate / 1000) * quantity;
    const providerCost = service.providerRate > 0
      ? (isFixedPackage ? service.providerRate : (service.providerRate / 1000) * quantity)
      : 0;
    const profit = amount - providerCost;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.walletBalance < amount) {
      return next(new ErrorResponse('Insufficient wallet balance', 400));
    }

    const newBalance = user.walletBalance - amount;

    await prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: newBalance },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: 'debit',
        amount,
        description: `Order for ${service.title}`,
        balanceAfter: newBalance,
        paymentMethod: 'order',
        status: 'completed',
      },
    });

    let order = await prisma.order.create({
      data: {
        userId: user.id,
        serviceId,
        link,
        quantity,
        amount,
        providerCost,
        profit,
        status: 'pending',
      },
      include: { service: { select: { id: true, title: true, category: true } } },
    });

    if (!service.isManual) {
      try {
        let smmClient = SMMProvider.getDefault();
        if (service.providerId) {
          const provider = await prisma.provider.findUnique({ where: { id: service.providerId } });
          if (provider) {
            smmClient = SMMProvider.fromDB(provider);
          }
        }
        const providerResponse = await smmClient.createOrder(
          service.providerServiceId,
          link,
          quantity
        );

        if (providerResponse && providerResponse.order) {
          order = await prisma.order.update({
            where: { id: order.id },
            data: {
              providerOrderId: providerResponse.order.toString(),
              status: 'processing',
            },
            include: { service: { select: { id: true, title: true, category: true } } },
          });
        }
      } catch (providerError) {
        console.error('SMM Provider Error:', providerError.message);

        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'cancelled' },
        });

        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        const refundBalance = updatedUser.walletBalance + amount;

        await prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: refundBalance },
        });

        await prisma.walletTransaction.create({
          data: {
            userId: user.id,
            type: 'credit',
            amount,
            description: `Refund - Provider error for order`,
            balanceAfter: refundBalance,
            paymentMethod: 'refund',
            orderId: order.id,
            status: 'completed',
          },
        });

        return next(new ErrorResponse('Failed to connect with SMM provider. Amount refunded.', 500));
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { service: { select: { id: true, title: true, category: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// User - get order stats (lightweight, no full order data)
exports.getUserOrderStats = async (req, res, next) => {
  try {
    const where = { userId: req.user.id };

    const [totalOrders, pendingOrders, completedOrders, totalSpent] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: { in: ['pending', 'processing', 'in_progress'] } } }),
      prisma.order.count({ where: { ...where, status: 'completed' } }),
      prisma.order.aggregate({ where: { ...where, status: 'completed' }, _sum: { amount: true } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: totalSpent._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        service: { select: { id: true, title: true, category: true, rate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view this order', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 50 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: { select: { id: true, title: true, category: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (
      (status === 'cancelled' || status === 'refunded') &&
      order.status !== 'cancelled' &&
      order.status !== 'refunded'
    ) {
      const existingRefund = await prisma.walletTransaction.findFirst({
        where: { orderId: order.id, type: 'credit', paymentMethod: 'refund' },
      });

      if (!existingRefund) {
        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        const newBalance = user.walletBalance + order.amount;

        await prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: newBalance },
        });

        await prisma.walletTransaction.create({
          data: {
            userId: user.id,
            type: 'credit',
            amount: order.amount,
            description: `Refund for order #${order.orderNumber}`,
            balanceAfter: newBalance,
            paymentMethod: 'refund',
            orderId: order.id,
            status: 'completed',
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        service: { select: { id: true, title: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (err) {
    next(err);
  }
};

exports.getOrderStats = async (req, res, next) => {
  try {
    const byStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { amount: true },
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: byStatus.map((s) => ({
          _id: s.status,
          count: s._count.id,
          totalAmount: s._sum.amount,
        })),
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
