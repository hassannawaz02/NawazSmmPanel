const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

exports.getBalance = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.status(200).json({
      success: true,
      data: { balance: user.walletBalance },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const where = { userId: req.user.id };

    if (type) where.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// User creates a fund request
exports.createFundRequest = async (req, res, next) => {
  try {
    const { paymentMethodId, amount, transactionId } = req.body;

    if (!paymentMethodId || !amount || !transactionId) {
      return next(new ErrorResponse('Payment method, amount and transaction ID are required', 400));
    }

    if (amount <= 0) {
      return next(new ErrorResponse('Amount must be greater than 0', 400));
    }

    const method = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!method || !method.isActive) {
      return next(new ErrorResponse('Payment method not available', 400));
    }

    if (amount < method.minAmount || amount > method.maxAmount) {
      return next(
        new ErrorResponse(
          `Amount must be between ${method.minAmount} and ${method.maxAmount}`,
          400
        )
      );
    }

    const fundRequest = await prisma.fundRequest.create({
      data: {
        userId: req.user.id,
        paymentMethodId,
        amount,
        transactionId,
        status: 'pending',
      },
      include: {
        paymentMethod: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: fundRequest });
  } catch (err) {
    next(err);
  }
};

// User gets their own fund requests
exports.getMyFundRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = { userId: req.user.id };

    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      prisma.fundRequest.findMany({
        where,
        include: {
          paymentMethod: { select: { id: true, name: true, accountNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.fundRequest.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// Admin gets all fund requests
exports.getFundRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const where = {};

    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      prisma.fundRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          paymentMethod: { select: { id: true, name: true, accountNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.fundRequest.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// Admin approves a fund request
exports.approveFundRequest = async (req, res, next) => {
  try {
    const request = await prisma.fundRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!request) {
      return next(new ErrorResponse('Fund request not found', 404));
    }

    if (request.status !== 'pending') {
      return next(new ErrorResponse('This request has already been processed', 400));
    }

    const newBalance = request.user.walletBalance + request.amount;

    await prisma.user.update({
      where: { id: request.userId },
      data: { walletBalance: newBalance },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: request.userId,
        type: 'credit',
        amount: request.amount,
        description: `Fund request approved - ${request.transactionId}`,
        balanceAfter: newBalance,
        paymentMethod: 'manual',
        status: 'completed',
      },
    });

    const updatedRequest = await prisma.fundRequest.update({
      where: { id: req.params.id },
      data: { status: 'approved', adminNote: req.body.adminNote || null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        paymentMethod: { select: { name: true } },
      },
    });

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (err) {
    next(err);
  }
};

// Admin rejects a fund request
exports.rejectFundRequest = async (req, res, next) => {
  try {
    const request = await prisma.fundRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return next(new ErrorResponse('Fund request not found', 404));
    }

    if (request.status !== 'pending') {
      return next(new ErrorResponse('This request has already been processed', 400));
    }

    const updatedRequest = await prisma.fundRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        adminNote: req.body.adminNote || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        paymentMethod: { select: { name: true } },
      },
    });

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (err) {
    next(err);
  }
};

// Admin manually adds funds (existing function - kept as is)
exports.adminAddFunds = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return next(new ErrorResponse('Please provide valid userId and amount', 400));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const newBalance = user.walletBalance + amount;

    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: newBalance },
    });

    await prisma.walletTransaction.create({
      data: {
        userId,
        type: 'credit',
        amount,
        description: description || 'Manual addition by admin',
        balanceAfter: newBalance,
        paymentMethod: 'manual',
        status: 'completed',
      },
    });

    res.status(200).json({
      success: true,
      data: { userId: user.id, name: user.name, newBalance },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, type, status } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};
