const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getProviders,
  getActiveProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  syncEnvProvider,
} = require('../controllers/providerController');
const { protect, authorize, validate } = require('../middleware');

const providerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('apiUrl').trim().notEmpty().withMessage('API URL is required'),
  body('apiKey').trim().notEmpty().withMessage('API Key is required'),
];

// Admin routes
router.get('/', protect, authorize('admin'), getProviders);
router.get('/active', protect, authorize('admin'), getActiveProviders);
router.post('/', protect, authorize('admin'), providerValidation, validate, createProvider);
router.post('/sync-env', protect, authorize('admin'), syncEnvProvider);
router.put('/:id', protect, authorize('admin'), updateProvider);
router.delete('/:id', protect, authorize('admin'), deleteProvider);

module.exports = router;
