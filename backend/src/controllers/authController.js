const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });

  const options = {
    expires: new Date(Date.now() + config.cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return next(new ErrorResponse('Username already taken', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: 'user',
      },
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new ErrorResponse('Account not found', 404));
    }

    if (!user.isActive) {
      return next(new ErrorResponse('Account is deactivated', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;

    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        return next(new ErrorResponse('Email already in use', 400));
      }
    }

    if (username && username !== req.user.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.user.id) {
        return next(new ErrorResponse('Username already taken', 400));
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, username, email },
    });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    sendTokenResponse(updatedUser, 200, res);
  } catch (err) {
    next(err);
  }
};
