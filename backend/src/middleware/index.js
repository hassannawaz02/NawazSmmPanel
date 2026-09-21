const { protect, optionalAuth, authorize } = require('./auth');
const errorHandler = require('./errorHandler');
const validate = require('./validate');

module.exports = {
  protect,
  optionalAuth,
  authorize,
  errorHandler,
  validate,
};
