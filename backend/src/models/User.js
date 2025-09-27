const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (name, email, password, role, wallet_balance, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, role, wallet_balance, created_at
    `;
    
    const values = [name, email, hashedPassword, role, 100000]; // Seed with ₹100,000
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role, wallet_balance, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateWalletBalance(userId, newBalance) {
    const query = 'UPDATE users SET wallet_balance = $1 WHERE id = $2 RETURNING wallet_balance';
    const result = await pool.query(query, [newBalance, userId]);
    return result.rows[0];
  }

  static async updateProfile(userId, updateData) {
    const { name, phone } = updateData;
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name), phone = COALESCE($2, phone)
      WHERE id = $3
      RETURNING id, name, email, phone, role, wallet_balance
    `;
    const result = await pool.query(query, [name, phone, userId]);
    return result.rows[0];
  }

  static async getAllUsers() {
    const query = `
      SELECT id, name, email, role, wallet_balance, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
