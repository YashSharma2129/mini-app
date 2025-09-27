const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAuditLogs,
  getAuditStats,
  getUserActivity,
  getResourceActivity,
  cleanOldLogs
} = require('../controllers/auditController');

// Get audit logs (Admin only)
router.get('/', authenticateToken, requireRole('admin'), getAuditLogs);

// Get audit statistics (Admin only)
router.get('/stats', authenticateToken, requireRole('admin'), getAuditStats);

// Get user activity
router.get('/user-activity', authenticateToken, getUserActivity);

// Get resource activity
router.get('/resource/:resource/:resourceId', authenticateToken, getResourceActivity);

// Clean old audit logs (Admin only)
router.post('/clean', authenticateToken, requireRole('admin'), cleanOldLogs);

module.exports = router;
