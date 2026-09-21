const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require('../controllers/paymentMethodController');
const { protect, authorize, validate } = require('../middleware');

const paymentMethodValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('accountTitle').trim().notEmpty().withMessage('Account title is required'),
];

// Public routes
router.get('/', getPaymentMethods);

// Admin routes
router.post('/', protect, authorize('admin'), paymentMethodValidation, validate, createPaymentMethod);
router.put('/:id', protect, authorize('admin'), updatePaymentMethod);
router.delete('/:id', protect, authorize('admin'), deletePaymentMethod);

module.exports = router;
