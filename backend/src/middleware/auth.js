const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config');

exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!req.user) {
      return next(new ErrorResponse('User not found', 401));
    }

    if (!req.user.isActive) {
      return next(new ErrorResponse('Account is deactivated', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
  } catch (err) {
    // ignore invalid token, continue without user
  }

  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
