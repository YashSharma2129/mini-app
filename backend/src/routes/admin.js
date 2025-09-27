const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  getDashboardStats,
  updateUserWallet
} = require('../controllers/adminController');

router.get('/dashboard', authenticateToken, requireRole(['admin']), getDashboardStats);
router.get('/users', authenticateToken, requireRole(['admin']), getAllUsers);
router.get('/users/:userId', authenticateToken, requireRole(['admin']), getUserById);
router.put('/users/:userId/wallet', authenticateToken, requireRole(['admin']), updateUserWallet);

module.exports = router;
