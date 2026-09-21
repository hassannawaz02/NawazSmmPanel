const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');

// Public - get active reviews for homepage
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// Admin - get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// Admin - create review
exports.createReview = async (req, res, next) => {
  try {
    const { name, avatar, text, rating, isActive, sortOrder } = req.body;

    if (!name || !text) {
      return next(new ErrorResponse('Name and text are required', 400));
    }

    const review = await prisma.review.create({
      data: {
        name,
        avatar: avatar || null,
        text,
        rating: rating || 5,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// Admin - update review
exports.updateReview = async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return next(new ErrorResponse('Review not found', 404));
    }

    const { name, avatar, text, rating, isActive, sortOrder } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        avatar: avatar !== undefined ? avatar : existing.avatar,
        text: text !== undefined ? text : existing.text,
        rating: rating !== undefined ? rating : existing.rating,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
      },
    });

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// Admin - delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return next(new ErrorResponse('Review not found', 404));
    }

    await prisma.review.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
