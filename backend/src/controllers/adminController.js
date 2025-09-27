const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const transactions = await Transaction.findByUserId(userId);
    
    const portfolioQuery = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.category,
        p.price as current_price,
        COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.units ELSE -t.units END), 0) as total_units,
        COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.total_amount ELSE 0 END), 0) as total_invested
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id AND t.user_id = $1
      GROUP BY p.id, p.name, p.category, p.price
      HAVING COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.units ELSE -t.units END), 0) > 0
      ORDER BY total_invested DESC
    `;
    
    const portfolioResult = await pool.query(portfolioQuery, [userId]);
    
    res.json({
      success: true,
      data: { 
        user,
        transactions,
        portfolio: portfolioResult.rows
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total_users);
    
    const productsResult = await pool.query('SELECT COUNT(*) as total_products FROM products');
    const totalProducts = parseInt(productsResult.rows[0].total_products);
    
    const transactionsResult = await pool.query('SELECT COUNT(*) as total_transactions FROM transactions');
    const totalTransactions = parseInt(transactionsResult.rows[0].total_transactions);
    
    const volumeResult = await pool.query('SELECT SUM(total_amount) as total_volume FROM transactions WHERE type = $1', ['buy']);
    const totalVolume = parseFloat(volumeResult.rows[0].total_volume) || 0;
    
    const recentTransactions = await Transaction.getAllTransactions();
    const recentTransactionsLimited = recentTransactions.slice(0, 10);
                
    const topProductsQuery = `
      SELECT 
        p.name,
        p.category,
        COUNT(t.id) as transaction_count,
        SUM(t.total_amount) as total_volume
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id
      GROUP BY p.id, p.name, p.category
      ORDER BY total_volume DESC
      LIMIT 5
    `;
    
    const topProductsResult = await pool.query(topProductsQuery);
    
    res.json({
      success: true,
      data: {
        stats: {
          total_users: totalUsers,
          total_products: totalProducts,
          total_transactions: totalTransactions,
          total_volume: totalVolume
        },
        recent_transactions: recentTransactionsLimited,
        top_products: topProductsResult.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUserWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newBalance = user.wallet_balance + parseFloat(amount);
    const updatedUser = await User.updateWalletBalance(userId, newBalance);
    
    res.json({
      success: true,
      message: 'User wallet updated successfully',
      data: { 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          wallet_balance: updatedUser.wallet_balance
        }
      }
    });
  } catch (error) {
    console.error('Update user wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getDashboardStats,
  updateUserWallet
};
