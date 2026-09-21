const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  sendMessage,
  broadcastMessage,
  getAllMessages,
  updateMessage,
  deleteMessage,
  getMyMessages,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/messageController');
const { protect, authorize, validate } = require('../middleware');

// User routes
router.get('/my', protect, getMyMessages);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllMessages);
router.post(
  '/admin/send',
  protect,
  authorize('admin'),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Message body is required'),
  ],
  validate,
  sendMessage
);
router.post(
  '/admin/broadcast',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Message body is required'),
  ],
  validate,
  broadcastMessage
);
router.put('/admin/:id', protect, authorize('admin'), updateMessage);
router.delete('/admin/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
