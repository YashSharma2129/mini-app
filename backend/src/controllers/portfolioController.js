const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await Portfolio.getUserPortfolio(userId);
    
    res.json({
      success: true,
      data: { portfolio }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await Portfolio.getPortfolioSummary(userId);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { 
        summary,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await Portfolio.getUserWatchlist(userId);
    
    res.json({
      success: true,
      data: { watchlist }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    const result = await Portfolio.addToWatchlist(userId, productId);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Product already in watchlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Product added to watchlist'
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    const result = await Portfolio.removeFromWatchlist(userId, productId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in watchlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Product removed from watchlist'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getPortfolio,
  getPortfolioSummary,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
