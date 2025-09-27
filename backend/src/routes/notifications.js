const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  createBulkNotifications
} = require('../controllers/notificationController');

// Validation middleware
const validateNotification = [
  body('user_id').isInt().withMessage('User ID must be a valid integer'),
  body('type').isIn(['order', 'alert', 'system', 'transaction']).withMessage('Invalid notification type'),
  body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
];

// Get user notifications
router.get('/', authenticateToken, getUserNotifications);

// Get unread notifications count
router.get('/unread-count', authenticateToken, getUnreadCount);

// Get notification statistics
router.get('/stats', authenticateToken, getNotificationStats);

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, markAllAsRead);

// Delete notification
router.delete('/:notificationId', authenticateToken, deleteNotification);

// Admin routes
router.post('/', authenticateToken, requireRole('admin'), validateNotification, createNotification);
router.post('/bulk', authenticateToken, requireRole('admin'), createBulkNotifications);

module.exports = router;
