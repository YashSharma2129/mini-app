const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getPortfolioAnalytics,
  getMarketAnalytics,
  getUserTradingAnalytics,
  getRiskAnalysis
} = require('../controllers/analyticsController');

// Get portfolio performance analytics
router.get('/portfolio', authenticateToken, getPortfolioAnalytics);

// Get market analytics
router.get('/market', getMarketAnalytics);

// Get user trading analytics
router.get('/trading', authenticateToken, getUserTradingAnalytics);

// Get risk analysis
router.get('/risk', authenticateToken, getRiskAnalysis);

module.exports = router;
