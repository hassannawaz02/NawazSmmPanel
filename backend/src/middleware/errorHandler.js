const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired', 401);
  }

  if (err.code === 'P2002') {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  if (err.code === 'P2025') {
    error = new ErrorResponse('Resource not found', 404);
  }

  if (err.code === 'P2003') {
    error = new ErrorResponse('Foreign key constraint failed', 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
