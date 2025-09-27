const { Pool } = require('pg');
const pool = require('../config/database');

// Get portfolio performance analytics
const getPortfolioAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get portfolio summary
    const portfolioQuery = `
      SELECT 
        p.product_id,
        pr.name as product_name,
        pr.symbol,
        pr.category,
        p.quantity,
        p.average_price,
        pr.current_price,
        (p.quantity * pr.current_price) as current_value,
        (p.quantity * p.average_price) as invested_amount,
        ((p.quantity * pr.current_price) - (p.quantity * p.average_price)) as unrealized_pnl,
        (((p.quantity * pr.current_price) - (p.quantity * p.average_price)) / (p.quantity * p.average_price) * 100) as return_percentage
      FROM portfolio p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = $1 AND p.quantity > 0
      ORDER BY current_value DESC
    `;

    const portfolioResult = await pool.query(portfolioQuery, [userId]);
    
    // Calculate total portfolio metrics
    const totalInvested = portfolioResult.rows.reduce((sum, row) => sum + parseFloat(row.invested_amount), 0);
    const totalCurrentValue = portfolioResult.rows.reduce((sum, row) => sum + parseFloat(row.current_value), 0);
    const totalUnrealizedPnL = totalCurrentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

    // Get category-wise allocation
    const categoryAllocation = portfolioResult.rows.reduce((acc, row) => {
      const category = row.category;
      if (!acc[category]) {
        acc[category] = { invested: 0, current: 0, percentage: 0 };
      }
      acc[category].invested += parseFloat(row.invested_amount);
      acc[category].current += parseFloat(row.current_value);
      return acc;
    }, {});

    // Calculate category percentages
    Object.keys(categoryAllocation).forEach(category => {
      categoryAllocation[category].percentage = 
        totalCurrentValue > 0 ? (categoryAllocation[category].current / totalCurrentValue) * 100 : 0;
    });

    // Get transaction history for performance chart
    const transactionQuery = `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN type = 'buy' THEN total_amount ELSE 0 END) as buy_amount,
        SUM(CASE WHEN type = 'sell' THEN total_amount ELSE 0 END) as sell_amount,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const transactionResult = await pool.query(transactionQuery, [userId]);

    res.json({
      success: true,
      data: {
        portfolio: {
          totalInvested,
          totalCurrentValue,
          totalUnrealizedPnL,
          totalReturnPercentage,
          holdings: portfolioResult.rows
        },
        allocation: categoryAllocation,
        transactionHistory: transactionResult.rows
      }
    });

  } catch (error) {
    console.error('Portfolio analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio analytics',
      error: error.message
    });
  }
};

// Get market analytics
const getMarketAnalytics = async (req, res) => {
  try {
    // Get top performing products
    const topPerformersQuery = `
      SELECT 
        id, name, symbol, category, current_price,
        (current_price - previous_close) as price_change,
        ((current_price - previous_close) / previous_close * 100) as price_change_percentage,
        volume, market_cap
      FROM products
      WHERE previous_close > 0
      ORDER BY price_change_percentage DESC
      LIMIT 10
    `;

    const topPerformersResult = await pool.query(topPerformersQuery);

    // Get market statistics
    const marketStatsQuery = `
      SELECT 
        COUNT(*) as total_products,
        AVG(current_price) as avg_price,
        SUM(market_cap) as total_market_cap,
        AVG(volume) as avg_volume
      FROM products
    `;

    const marketStatsResult = await pool.query(marketStatsQuery);

    // Get category performance
    const categoryPerformanceQuery = `
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(current_price) as avg_price,
        SUM(market_cap) as total_market_cap,
        AVG(volume) as avg_volume
      FROM products
      GROUP BY category
      ORDER BY total_market_cap DESC
    `;

    const categoryPerformanceResult = await pool.query(categoryPerformanceQuery);

    res.json({
      success: true,
      data: {
        topPerformers: topPerformersResult.rows,
        marketStats: marketStatsResult.rows[0],
        categoryPerformance: categoryPerformanceResult.rows
      }
    });

  } catch (error) {
    console.error('Market analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market analytics',
      error: error.message
    });
  }
};

// Get user trading analytics
const getUserTradingAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get trading summary
    const tradingSummaryQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'buy' THEN total_amount ELSE 0 END) as total_buy_amount,
        SUM(CASE WHEN type = 'sell' THEN total_amount ELSE 0 END) as total_sell_amount,
        SUM(CASE WHEN type = 'buy' THEN units ELSE 0 END) as total_buy_quantity,
        SUM(CASE WHEN type = 'sell' THEN units ELSE 0 END) as total_sell_quantity,
        AVG(price_per_unit) as avg_transaction_price
      FROM transactions
      WHERE user_id = $1
    `;

    const tradingSummaryResult = await pool.query(tradingSummaryQuery, [userId]);

    // Get monthly trading activity
    const monthlyActivityQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN type = 'buy' THEN total_amount ELSE 0 END) as buy_amount,
        SUM(CASE WHEN type = 'sell' THEN total_amount ELSE 0 END) as sell_amount
      FROM transactions
      WHERE user_id = $1
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    const monthlyActivityResult = await pool.query(monthlyActivityQuery, [userId]);

    // Get top traded products
    const topTradedProductsQuery = `
      SELECT 
        p.name, p.symbol, p.category,
        COUNT(t.id) as transaction_count,
        SUM(t.units) as total_quantity,
        SUM(t.total_amount) as total_amount,
        AVG(t.price_per_unit) as avg_price
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.user_id = $1
      GROUP BY p.id, p.name, p.symbol, p.category
      ORDER BY total_amount DESC
      LIMIT 10
    `;

    const topTradedProductsResult = await pool.query(topTradedProductsQuery, [userId]);

    res.json({
      success: true,
      data: {
        summary: tradingSummaryResult.rows[0],
        monthlyActivity: monthlyActivityResult.rows,
        topTradedProducts: topTradedProductsResult.rows
      }
    });

  } catch (error) {
    console.error('User trading analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user trading analytics',
      error: error.message
    });
  }
};

// Get risk analysis
const getRiskAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get portfolio concentration risk
    const concentrationQuery = `
      SELECT 
        p.product_id,
        pr.name as product_name,
        pr.symbol,
        p.quantity,
        p.average_price,
        pr.current_price,
        (p.quantity * pr.current_price) as current_value,
        pr.category
      FROM portfolio p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = $1 AND p.quantity > 0
      ORDER BY current_value DESC
    `;

    const concentrationResult = await pool.query(concentrationQuery, [userId]);

    const totalValue = concentrationResult.rows.reduce((sum, row) => sum + parseFloat(row.current_value), 0);
    
    // Calculate concentration metrics
    const concentration = concentrationResult.rows.map(row => ({
      ...row,
      percentage: totalValue > 0 ? (parseFloat(row.current_value) / totalValue) * 100 : 0
    }));

    // Calculate Herfindahl-Hirschman Index (HHI) for concentration
    const hhi = concentration.reduce((sum, row) => sum + Math.pow(row.percentage, 2), 0);

    // Get volatility analysis (simplified)
    const volatilityQuery = `
      SELECT 
        p.product_id,
        pr.name as product_name,
        pr.symbol,
        pr.category,
        p.quantity,
        pr.current_price,
        (p.quantity * pr.current_price) as current_value,
        pr.pe_ratio,
        pr.market_cap
      FROM portfolio p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = $1 AND p.quantity > 0
    `;

    const volatilityResult = await pool.query(volatilityQuery, [userId]);

    // Calculate risk metrics
    const riskMetrics = {
      concentration: {
        hhi: hhi,
        topHoldingPercentage: concentration[0]?.percentage || 0,
        top5HoldingsPercentage: concentration.slice(0, 5).reduce((sum, row) => sum + row.percentage, 0)
      },
      diversification: {
        totalHoldings: concentration.length,
        categoryDiversification: [...new Set(concentration.map(row => row.category))].length
      },
      portfolio: volatilityResult.rows
    };

    res.json({
      success: true,
      data: riskMetrics
    });

  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk analysis',
      error: error.message
    });
  }
};

module.exports = {
  getPortfolioAnalytics,
  getMarketAnalytics,
  getUserTradingAnalytics,
  getRiskAnalysis
};
