const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  buyProduct,
  getUserTransactions,
  getAllTransactions,
  getTransactionStats
} = require('../controllers/transactionController');

// User routes
router.post('/buy', authenticateToken, buyProduct);
router.get('/my', authenticateToken, getUserTransactions);
router.get('/stats', authenticateToken, getTransactionStats);

// Admin routes
router.get('/all', authenticateToken, requireRole(['admin']), getAllTransactions);

module.exports = router;
