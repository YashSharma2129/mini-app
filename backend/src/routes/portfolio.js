const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getPortfolio,
  getPortfolioSummary,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/portfolioController');

router.get('/', authenticateToken, getPortfolio);
router.get('/summary', authenticateToken, getPortfolioSummary);
router.get('/watchlist', authenticateToken, getWatchlist);
router.post('/watchlist/:productId', authenticateToken, addToWatchlist);
router.delete('/watchlist/:productId', authenticateToken, removeFromWatchlist);

module.exports = router;
