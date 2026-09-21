const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize, validate } = require('../middleware');

const reviewValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('text').trim().notEmpty().withMessage('Text is required'),
];

// Public
router.get('/', getReviews);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllReviews);
router.post('/', protect, authorize('admin'), reviewValidation, validate, createReview);
router.put('/:id', protect, authorize('admin'), updateReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
