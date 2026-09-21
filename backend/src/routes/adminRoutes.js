const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboardStats,
} = require('../controllers/adminController');
const {
  getFinancialOverview,
  getDailyBreakdown,
  getCategoryBreakdown,
  getServiceBreakdown,
  getProviderSpending,
  getGrowthComparison,
  getHourlyAndWeekday,
  getTopUsers,
} = require('../controllers/analyticsController');
const { syncFromProvider } = require('../controllers/serviceController');
const { protect, authorize, validate } = require('../middleware');

// All routes require admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Analytics
router.get('/analytics/overview', getFinancialOverview);
router.get('/analytics/daily', getDailyBreakdown);
router.get('/analytics/categories', getCategoryBreakdown);
router.get('/analytics/services', getServiceBreakdown);
router.get('/analytics/providers', getProviderSpending);
router.get('/analytics/growth', getGrowthComparison);
router.get('/analytics/hourly', getHourlyAndWeekday);
router.get('/analytics/top-users', getTopUsers);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Provider sync
router.post('/sync-services', syncFromProvider);

module.exports = router;
