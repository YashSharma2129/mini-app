const { Pool } = require('pg');
const pool = require('../config/database');

class Alert {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.alert_type = data.alert_type; // 'price_above', 'price_below', 'volume_above'
    this.target_value = data.target_value;
    this.is_active = data.is_active;
    this.triggered_at = data.triggered_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new alert
  static async create(alertData) {
    const {
      user_id,
      product_id,
      alert_type,
      target_value
    } = alertData;

    const query = `
      INSERT INTO alerts (user_id, product_id, alert_type, target_value, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id,
        product_id,
        alert_type,
        target_value
      ]);

      return new Alert(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get alerts by user
  static async getByUserId(userId) {
    const query = `
      SELECT a.*, p.name as product_name, p.symbol, p.current_price
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new Alert(row));
    } catch (error) {
      throw error;
    }
  }

  // Get active alerts
  static async getActiveAlerts() {
    const query = `
      SELECT a.*, p.name as product_name, p.symbol, p.current_price, u.email
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
      ORDER BY a.created_at ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => new Alert(row));
    } catch (error) {
      throw error;
    }
  }

  // Check and trigger alerts
  static async checkAlerts() {
    const activeAlerts = await this.getActiveAlerts();
    const triggeredAlerts = [];

    for (const alert of activeAlerts) {
      let shouldTrigger = false;

      switch (alert.alert_type) {
        case 'price_above':
          shouldTrigger = alert.current_price > alert.target_value;
          break;
        case 'price_below':
          shouldTrigger = alert.current_price < alert.target_value;
          break;
        case 'volume_above':
          // This would need volume data from products table
          shouldTrigger = false; // Placeholder
          break;
      }

      if (shouldTrigger) {
        try {
          // Mark alert as triggered
          await this.triggerAlert(alert.id);
          triggeredAlerts.push(alert);
        } catch (error) {
          console.error(`Failed to trigger alert ${alert.id}:`, error);
        }
      }
    }

    return triggeredAlerts;
  }

  // Trigger an alert
  static async triggerAlert(alertId) {
    const query = `
      UPDATE alerts 
      SET is_active = false, triggered_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [alertId]);
      return new Alert(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Delete an alert
  static async delete(alertId, userId) {
    const query = `
      DELETE FROM alerts 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [alertId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Alert not found or access denied');
      }

      return new Alert(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update alert
  static async update(alertId, userId, updateData) {
    const { alert_type, target_value, is_active } = updateData;
    
    const query = `
      UPDATE alerts 
      SET alert_type = $1, target_value = $2, is_active = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        alert_type,
        target_value,
        is_active,
        alertId,
        userId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Alert not found or access denied');
      }

      return new Alert(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Alert;
