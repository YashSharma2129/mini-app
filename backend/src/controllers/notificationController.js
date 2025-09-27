const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await Notification.getByUserId(userId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedCount = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      data: { updatedCount }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.delete(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: notification
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Notification.getStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

// Create notification (Admin only)
const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { user_id, type, title, message, data } = req.body;

    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      data
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Create bulk notifications (Admin only)
const createBulkNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notifications } = req.body;

    const createdNotifications = await Notification.createBulk(notifications);

    res.status(201).json({
      success: true,
      message: `${createdNotifications.length} notifications created successfully`,
      data: createdNotifications
    });

  } catch (error) {
    console.error('Create bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  createBulkNotifications
};
