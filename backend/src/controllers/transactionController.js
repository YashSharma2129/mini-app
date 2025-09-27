const pool = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { validateRequest, schemas } = require('../middleware/validation');

const buyProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { productId, units } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const totalAmount = units * product.price;
    
    if (user.wallet_balance < totalAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    const transaction = await Transaction.create({
      user_id: userId,
      product_id: productId,
      type: 'buy',
      units: units,
      price_per_unit: product.price,
      total_amount: totalAmount
    });
    
    const newBalance = user.wallet_balance - totalAmount;
    await User.updateWalletBalance(userId, newBalance);
    
    // Update portfolio
    const portfolioQuery = `
      INSERT INTO portfolio (user_id, product_id, quantity, average_price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET 
        quantity = portfolio.quantity + $3,
        average_price = (portfolio.quantity * portfolio.average_price + $3 * $4) / (portfolio.quantity + $3)
    `;
    await client.query(portfolioQuery, [userId, productId, units, product.price]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Product purchased successfully',
      data: {
        transaction: {
          id: transaction.id,
          product_name: product.name,
          units: transaction.units,
          price_per_unit: transaction.price_per_unit,
          total_amount: transaction.total_amount,
          created_at: transaction.created_at
        },
        new_wallet_balance: newBalance
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Buy product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);
    
    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAllTransactions();
    
    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Transaction.getTransactionStats(userId);
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  buyProduct: [validateRequest(schemas.buyProduct), buyProduct],
  getUserTransactions,
  getAllTransactions,
  getTransactionStats
};
