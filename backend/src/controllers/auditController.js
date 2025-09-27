const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// Get audit logs with filters
const getAuditLogs = async (req, res) => {
  try {
    const {
      user_id,
      action,
      resource,
      start_date,
      end_date,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      user_id,
      action,
      resource,
      start_date,
      end_date
    };

    const logs = await AuditLog.getLogs(filters, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// Get audit statistics
const getAuditStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const filters = {
      start_date,
      end_date
    };

    const stats = await AuditLog.getStats(filters);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const activity = await AuditLog.getUserActivity(userId, parseInt(limit));

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// Get resource activity
const getResourceActivity = async (req, res) => {
  try {
    const { resource, resourceId } = req.params;
    const { limit = 50 } = req.query;

    const activity = await AuditLog.getResourceActivity(resource, resourceId, parseInt(limit));

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get resource activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource activity',
      error: error.message
    });
  }
};

// Clean old audit logs (Admin only)
const cleanOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const deletedCount = await AuditLog.cleanOldLogs(daysToKeep);

    res.json({
      success: true,
      message: `Cleaned ${deletedCount} old audit logs`,
      data: { deletedCount }
    });

  } catch (error) {
    console.error('Clean old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old audit logs',
      error: error.message
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
  getUserActivity,
  getResourceActivity,
  cleanOldLogs
};
