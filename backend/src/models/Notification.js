const { Pool } = require('pg');
const pool = require('../config/database');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.data = data.data;
    this.is_read = data.is_read;
    this.created_at = data.created_at;
    this.read_at = data.read_at;
  }

  // Create a new notification
  static async create(notificationData) {
    const {
      user_id,
      type,
      title,
      message,
      data = null
    } = notificationData;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, is_read)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      ]);

      return new Notification(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get notifications by user
  static async getByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Notification(row));
    } catch (error) {
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

    try {
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].unread_count);
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [notificationId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      return new Notification(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `;

    try {
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].updated_count);
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  static async delete(notificationId, userId) {
    const query = `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [notificationId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      return new Notification(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Create bulk notifications
  static async createBulk(notifications) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const results = [];
      for (const notification of notifications) {
        const query = `
          INSERT INTO notifications (user_id, type, title, message, data, is_read)
          VALUES ($1, $2, $3, $4, $5, false)
          RETURNING *
        `;

        const result = await client.query(query, [
          notification.user_id,
          notification.type,
          notification.title,
          notification.message,
          notification.data ? JSON.stringify(notification.data) : null
        ]);

        results.push(new Notification(result.rows[0]));
      }

      await client.query('COMMIT');
      return results;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get notification statistics
  static async getStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count,
        COUNT(CASE WHEN type = 'order' THEN 1 END) as order_notifications,
        COUNT(CASE WHEN type = 'alert' THEN 1 END) as alert_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
        COUNT(CASE WHEN type = 'transaction' THEN 1 END) as transaction_notifications
      FROM notifications
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Clean old notifications
  static async cleanOld(olderThanDays = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '${olderThanDays} days'
      RETURNING COUNT(*) as deleted_count
    `;

    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].deleted_count);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;
