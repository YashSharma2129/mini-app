const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { product_id, order_type, quantity, order_price } = req.body;
    const user_id = req.user.id;

    // Get current product price
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate order
    if (order_type === 'buy') {
      const totalAmount = quantity * (order_price || product.current_price);
      if (req.user.wallet_balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
    }

    const orderData = {
      user_id,
      product_id,
      order_type,
      quantity,
      price: order_price || product.price,
      order_price
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const orders = await Order.getByUserId(userId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Execute pending orders (Admin only)
const executePendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.getPendingOrders();
    const results = [];

    for (const order of pendingOrders) {
      try {
        const result = await Order.executeOrder(order.id);
        results.push({
          orderId: order.id,
          status: 'executed',
          message: result.message
        });
      } catch (error) {
        results.push({
          orderId: order.id,
          status: 'failed',
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Order execution completed',
      data: results
    });

  } catch (error) {
    console.error('Execute orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute orders',
      error: error.message
    });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.cancelOrder(orderId, userId);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Order.getOrderStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// Get pending orders (Admin only)
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.getPendingOrders();

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get pending orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending orders',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  executePendingOrders,
  cancelOrder,
  getOrderStats,
  getPendingOrders
};
