const pool = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { user_id, product_id, type, units, price_per_unit, total_amount } = transactionData;
    
    const query = `
      INSERT INTO transactions (user_id, product_id, type, units, price_per_unit, total_amount, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const values = [user_id, product_id, type, units, price_per_unit, total_amount];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT t.*, p.name as product_name, p.category
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getAllTransactions() {
    const query = `
      SELECT t.*, u.name as user_name, u.email, p.name as product_name, p.category
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN products p ON t.product_id = p.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getTransactionStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'buy' THEN total_amount ELSE 0 END) as total_invested,
        SUM(CASE WHEN type = 'buy' THEN units ELSE -units END) as total_units
      FROM transactions
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = Transaction;
