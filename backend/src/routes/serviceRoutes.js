const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  bulkDeleteServices,
  getCategories,
  checkSortOrder,
} = require('../controllers/serviceController');
const { protect, optionalAuth, authorize, validate } = require('../middleware');

// Validation rules
const serviceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('rate').isNumeric().withMessage('Rate must be a number'),
  body('min').isInt({ min: 1 }).withMessage('Minimum must be at least 1'),
  body('max').isInt({ min: 1 }).withMessage('Maximum must be at least 1'),
  body('providerServiceId')
    .trim()
    .notEmpty()
    .withMessage('Provider service ID is required'),
];

// Public routes (optional auth - admin gets all services, users get active only)
router.get('/', optionalAuth, getServices);
router.get('/categories', getCategories);
router.get('/check-sort-order', protect, authorize('admin'), checkSortOrder);
router.get('/:id', getService);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  serviceValidation,
  validate,
  createService
);
router.post('/bulk-delete', protect, authorize('admin'), bulkDeleteServices);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateService
);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
