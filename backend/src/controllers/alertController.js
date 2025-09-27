const Alert = require('../models/Alert');
const { validationResult } = require('express-validator');

// Create a new alert
const createAlert = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { product_id, alert_type, target_value } = req.body;
    const user_id = req.user.id;

    const alertData = {
      user_id,
      product_id,
      alert_type,
      target_value
    };

    const alert = await Alert.create(alertData);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
};

// Get user alerts
const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const alerts = await Alert.getByUserId(userId);

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Get user alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Update an alert
const updateAlert = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { alertId } = req.params;
    const userId = req.user.id;
    const { alert_type, target_value, is_active } = req.body;

    const alert = await Alert.update(alertId, userId, {
      alert_type,
      target_value,
      is_active
    });

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });

  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
};

// Delete an alert
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await Alert.delete(alertId, userId);

    res.json({
      success: true,
      message: 'Alert deleted successfully',
      data: alert
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: error.message
    });
  }
};

// Check and trigger alerts (Admin only)
const checkAlerts = async (req, res) => {
  try {
    const triggeredAlerts = await Alert.checkAlerts();

    res.json({
      success: true,
      message: `Checked alerts, ${triggeredAlerts.length} triggered`,
      data: triggeredAlerts
    });

  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check alerts',
      error: error.message
    });
  }
};

module.exports = {
  createAlert,
  getUserAlerts,
  updateAlert,
  deleteAlert,
  checkAlerts
};
