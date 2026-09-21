const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  syncFromServices,
} = require('../controllers/categoryController');
const { protect, authorize, validate } = require('../middleware');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
];

// Admin routes
router.get('/', protect, authorize('admin'), getCategories);
router.post('/', protect, authorize('admin'), categoryValidation, validate, createCategory);
router.post('/sync-from-services', protect, authorize('admin'), syncFromServices);
router.put('/reorder', protect, authorize('admin'), reorderCategories);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
