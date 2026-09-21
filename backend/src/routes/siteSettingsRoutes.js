const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/siteSettingsController');
const { protect, authorize } = require('../middleware');

// Public - get settings
router.get('/', getSettings);

// Admin - update settings
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
