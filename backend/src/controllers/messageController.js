const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

// Admin: Send message to a user
exports.sendMessage = async (req, res, next) => {
  try {
    const { userId, title, body, type } = req.body;

    if (!userId || !title || !body) {
      return next(new ErrorResponse('Please provide userId, title and body', 400));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const message = await prisma.message.create({
      data: { userId, title, body, type: type || 'info' },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// Admin: Broadcast message to all users
exports.broadcastMessage = async (req, res, next) => {
  try {
    const { title, body, type } = req.body;

    if (!title || !body) {
      return next(new ErrorResponse('Please provide title and body', 400));
    }

    const users = await prisma.user.findMany({ select: { id: true } });

    const messages = await prisma.message.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        body,
        type: type || 'announcement',
      })),
    });

    res.status(201).json({
      success: true,
      data: { sent: messages.count },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all messages
exports.getAllMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId } = req.query;
    const where = {};

    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.message.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update message
exports.updateMessage = async (req, res, next) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { title: req.body.title, body: req.body.body, type: req.body.type },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete message
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    await prisma.message.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// User: Get my messages
exports.getMyMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total, unreadCount] = await Promise.all([
      prisma.message.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.message.count({ where: { userId: req.user.id } }),
      prisma.message.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// User: Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

// User: Mark message as read
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    if (message.userId !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    await prisma.message.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// User: Mark all as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await prisma.message.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
