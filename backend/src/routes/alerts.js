const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  createAlert,
  getUserAlerts,
  updateAlert,
  deleteAlert,
  checkAlerts
} = require('../controllers/alertController');

// Validation middleware
const validateAlert = [
  body('product_id').isInt().withMessage('Product ID must be a valid integer'),
  body('alert_type').isIn(['price_above', 'price_below', 'volume_above']).withMessage('Invalid alert type'),
  body('target_value').isFloat({ min: 0.01 }).withMessage('Target value must be a positive number')
];

// Create a new alert
router.post('/', authenticateToken, validateAlert, createAlert);

// Get user alerts
router.get('/', authenticateToken, getUserAlerts);

// Update an alert
router.put('/:alertId', authenticateToken, validateAlert, updateAlert);

// Delete an alert
router.delete('/:alertId', authenticateToken, deleteAlert);

// Admin route - Check and trigger alerts
router.post('/check', authenticateToken, requireRole('admin'), checkAlerts);

module.exports = router;
