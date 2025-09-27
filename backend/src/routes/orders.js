const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  executePendingOrders,
  cancelOrder,
  getOrderStats,
  getPendingOrders
} = require('../controllers/orderController');

// Validation middleware
const validateOrder = [
  body('product_id').isInt().withMessage('Product ID must be a valid integer'),
  body('order_type').isIn(['buy', 'sell']).withMessage('Order type must be buy or sell'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('order_price').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (isNaN(value) || parseFloat(value) <= 0) {
      throw new Error('Order price must be a positive number');
    }
    return true;
  })
];

// Create a new order
router.post('/', authenticateToken, validateOrder, createOrder);

// Get user orders
router.get('/', authenticateToken, getUserOrders);

// Get order statistics
router.get('/stats', authenticateToken, getOrderStats);

// Cancel an order
router.delete('/:orderId', authenticateToken, cancelOrder);

// Admin routes
router.get('/pending', authenticateToken, requireRole('admin'), getPendingOrders);
router.post('/execute', authenticateToken, requireRole('admin'), executePendingOrders);

module.exports = router;
