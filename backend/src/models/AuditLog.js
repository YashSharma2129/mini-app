const { Pool } = require('pg');
const pool = require('../config/database');

class AuditLog {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.action = data.action;
    this.resource = data.resource;
    this.resource_id = data.resource_id;
    this.details = data.details;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.created_at = data.created_at;
  }

  // Create a new audit log entry
  static async create(auditData) {
    const {
      user_id,
      action,
      resource,
      resource_id,
      details,
      ip_address,
      user_agent
    } = auditData;

    const query = `
      INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id,
        action,
        resource,
        resource_id,
        details,
        ip_address,
        user_agent
      ]);

      return new AuditLog(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get audit logs with pagination
  static async getLogs(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT al.*, u.email as user_email, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.user_id) {
      paramCount++;
      query += ` AND al.user_id = $${paramCount}`;
      params.push(filters.user_id);
    }

    if (filters.action) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(filters.action);
    }

    if (filters.resource) {
      paramCount++;
      query += ` AND al.resource = $${paramCount}`;
      params.push(filters.resource);
    }

    if (filters.start_date) {
      paramCount++;
      query += ` AND al.created_at >= $${paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      query += ` AND al.created_at <= $${paramCount}`;
      params.push(filters.end_date);
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    try {
      const result = await pool.query(query, params);
      return result.rows.map(row => new AuditLog(row));
    } catch (error) {
      throw error;
    }
  }

  // Get audit statistics
  static async getStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
        COUNT(CASE WHEN action = 'logout' THEN 1 END) as logout_count,
        COUNT(CASE WHEN action = 'create' THEN 1 END) as create_count,
        COUNT(CASE WHEN action = 'update' THEN 1 END) as update_count,
        COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_count,
        COUNT(CASE WHEN action = 'view' THEN 1 END) as view_count
      FROM audit_logs
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.start_date) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(filters.end_date);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user activity summary
  static async getUserActivity(userId, limit = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activity_count,
        COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
        COUNT(CASE WHEN action = 'create' THEN 1 END) as create_count,
        COUNT(CASE WHEN action = 'update' THEN 1 END) as update_count,
        COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_count
      FROM audit_logs
      WHERE user_id = $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get resource activity
  static async getResourceActivity(resource, resourceId, limit = 50) {
    const query = `
      SELECT al.*, u.email as user_email, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.resource = $1 AND al.resource_id = $2
      ORDER BY al.created_at DESC
      LIMIT $3
    `;

    try {
      const result = await pool.query(query, [resource, resourceId, limit]);
      return result.rows.map(row => new AuditLog(row));
    } catch (error) {
      throw error;
    }
  }

  // Clean old audit logs (for maintenance)
  static async cleanOldLogs(daysToKeep = 90) {
    const query = `
      DELETE FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
      RETURNING COUNT(*) as deleted_count
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0].deleted_count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuditLog;
