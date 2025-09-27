const { Pool } = require('pg');
const pool = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.order_type = data.order_type; // 'buy' or 'sell'
    this.order_status = data.order_status; // 'pending', 'executed', 'cancelled'
    this.quantity = data.quantity;
    this.price = data.price;
    this.order_price = data.order_price; // For limit orders
    this.order_date = data.order_date;
    this.execution_date = data.execution_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new order
  static async create(orderData) {
    const {
      user_id,
      product_id,
      order_type,
      quantity,
      price,
      order_price = null
    } = orderData;

    const query = `
      INSERT INTO orders (user_id, product_id, order_type, order_status, quantity, price, order_price)
      VALUES ($1, $2, $3, 'pending', $4, $5, $6)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id,
        product_id,
        order_type,
        quantity,
        price,
        order_price
      ]);

      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get orders by user
  static async getByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT o.*, p.name as product_name, p.symbol, p.category
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new Order(row));
    } catch (error) {
      throw error;
    }
  }

  // Get pending orders
  static async getPendingOrders() {
    const query = `
      SELECT o.*, p.name as product_name, p.symbol, p.current_price
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.order_status = 'pending'
      ORDER BY o.created_at ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => new Order(row));
    } catch (error) {
      throw error;
    }
  }

  // Execute a pending order
  static async executeOrder(orderId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get order details
      const orderQuery = `
        SELECT o.*, p.current_price, u.wallet_balance
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.user_id = u.id
        WHERE o.id = $1 AND o.order_status = 'pending'
      `;
      
      const orderResult = await client.query(orderQuery, [orderId]);
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found or already executed');
      }

      const order = orderResult.rows[0];
      const currentPrice = order.current_price;
      const totalAmount = order.quantity * currentPrice;

      // Check if it's a buy order and user has sufficient balance
      if (order.order_type === 'buy' && order.wallet_balance < totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Check if it's a sell order and user has sufficient quantity
      if (order.order_type === 'sell') {
        const portfolioQuery = `
          SELECT quantity FROM portfolio 
          WHERE user_id = $1 AND product_id = $2
        `;
        const portfolioResult = await client.query(portfolioQuery, [order.user_id, order.product_id]);
        
        if (portfolioResult.rows.length === 0 || portfolioResult.rows[0].quantity < order.quantity) {
          throw new Error('Insufficient quantity in portfolio');
        }
      }

      // Update order status
      const updateOrderQuery = `
        UPDATE orders 
        SET order_status = 'executed', execution_date = NOW(), price = $1
        WHERE id = $2
      `;
      await client.query(updateOrderQuery, [currentPrice, orderId]);

      // Update user wallet
      if (order.order_type === 'buy') {
        const updateWalletQuery = `
          UPDATE users 
          SET wallet_balance = wallet_balance - $1
          WHERE id = $2
        `;
        await client.query(updateWalletQuery, [totalAmount, order.user_id]);
      } else {
        const updateWalletQuery = `
          UPDATE users 
          SET wallet_balance = wallet_balance + $1
          WHERE id = $2
        `;
        await client.query(updateWalletQuery, [totalAmount, order.user_id]);
      }

      // Update portfolio
      if (order.order_type === 'buy') {
        const portfolioQuery = `
          INSERT INTO portfolio (user_id, product_id, quantity, average_price)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, product_id)
          DO UPDATE SET 
            quantity = portfolio.quantity + $3,
            average_price = (portfolio.quantity * portfolio.average_price + $3 * $4) / (portfolio.quantity + $3)
        `;
        await client.query(portfolioQuery, [order.user_id, order.product_id, order.quantity, currentPrice]);
      } else {
        const portfolioQuery = `
          UPDATE portfolio 
          SET quantity = quantity - $1
          WHERE user_id = $2 AND product_id = $3
        `;
        await client.query(portfolioQuery, [order.quantity, order.user_id, order.product_id]);
      }

      // Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (user_id, product_id, transaction_type, quantity, price, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(transactionQuery, [
        order.user_id,
        order.product_id,
        order.order_type,
        order.quantity,
        currentPrice,
        totalAmount
      ]);

      await client.query('COMMIT');
      return { success: true, message: 'Order executed successfully' };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancel an order
  static async cancelOrder(orderId, userId) {
    const query = `
      UPDATE orders 
      SET order_status = 'cancelled'
      WHERE id = $1 AND user_id = $2 AND order_status = 'pending'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [orderId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Order not found or cannot be cancelled');
      }

      return new Order(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get order statistics
  static async getOrderStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN order_status = 'executed' THEN 1 END) as executed_orders,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN order_type = 'buy' AND order_status = 'executed' THEN quantity * price ELSE 0 END) as total_buy_amount,
        SUM(CASE WHEN order_type = 'sell' AND order_status = 'executed' THEN quantity * price ELSE 0 END) as total_sell_amount
      FROM orders
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
