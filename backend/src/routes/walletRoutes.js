const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getBalance,
  getTransactionHistory,
  createFundRequest,
  getMyFundRequests,
  getFundRequests,
  approveFundRequest,
  rejectFundRequest,
  adminAddFunds,
  getAllTransactions,
} = require('../controllers/walletController');
const { protect, authorize, validate } = require('../middleware');

// Validation rules
const fundRequestValidation = [
  body('paymentMethodId').notEmpty().withMessage('Payment method is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0'),
  body('transactionId').trim().notEmpty().withMessage('Transaction ID is required'),
];

const adminAddFundsValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0'),
];

// User routes
router.get('/balance', protect, getBalance);
router.get('/history', protect, getTransactionHistory);
router.post('/fund-request', protect, fundRequestValidation, validate, createFundRequest);
router.get('/my-fund-requests', protect, getMyFundRequests);

// Admin routes
router.get('/fund-requests', protect, authorize('admin'), getFundRequests);
router.put('/fund-requests/:id/approve', protect, authorize('admin'), approveFundRequest);
router.put('/fund-requests/:id/reject', protect, authorize('admin'), rejectFundRequest);
router.post(
  '/admin/add-funds',
  protect,
  authorize('admin'),
  adminAddFundsValidation,
  validate,
  adminAddFunds
);
router.get('/admin/transactions', protect, authorize('admin'), getAllTransactions);

module.exports = router;
