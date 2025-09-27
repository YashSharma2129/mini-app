const pool = require('../config/database');

class Portfolio {
  static async getUserPortfolio(userId) {
    const query = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.category,
        p.price as current_price,
        COALESCE(port.quantity, 0) as total_units,
        COALESCE(port.quantity * port.average_price, 0) as total_invested
      FROM products p
      LEFT JOIN portfolio port ON p.id = port.product_id AND port.user_id = $1
      WHERE port.quantity > 0
      ORDER BY total_invested DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getPortfolioSummary(userId) {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(port.quantity * port.average_price), 0) as total_invested,
          COALESCE(SUM(port.quantity * p.price), 0) as current_value
        FROM portfolio port
        JOIN products p ON port.product_id = p.id
        WHERE port.user_id = $1
        GROUP BY port.user_id
      `;
      
      const result = await pool.query(query, [userId]);
      const summary = result.rows[0] || { total_invested: 0, current_value: 0 };
      
      const totalInvested = parseFloat(summary.total_invested) || 0;
      const currentValue = parseFloat(summary.current_value) || 0;
      const returns = currentValue - totalInvested;
      const returnsPercentage = totalInvested > 0 ? (returns / totalInvested) * 100 : 0;
      
      return {
        total_invested: totalInvested,
        current_value: currentValue,
        returns: returns,
        returns_percentage: returnsPercentage
      };
    } catch (error) {
      console.error('Portfolio summary query error:', error);
      return {
        total_invested: 0,
        current_value: 0,
        returns: 0,
        returns_percentage: 0
      };
    }
  }

  static async getUserWatchlist(userId) {
    const query = `
      SELECT p.*
      FROM products p
      JOIN watchlist w ON p.id = w.product_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addToWatchlist(userId, productId) {
    const query = `
      INSERT INTO watchlist (user_id, product_id, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  }

  static async removeFromWatchlist(userId, productId) {
    const query = `
      DELETE FROM watchlist
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  }

  static async isInWatchlist(userId, productId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM watchlist
        WHERE user_id = $1 AND product_id = $2
      ) as is_watched
    `;
    
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0].is_watched;
  }
}

module.exports = Portfolio;
