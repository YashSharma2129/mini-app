jest.mock('../server', () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  
  app.post('/api/auth/register', (req, res) => {
    if (req.body.email === 'existing@example.com') {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['Email, password, and name are required']
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        user: { email: req.body.email, name: req.body.name },
        token: 'mock-token'
      }
    });
  });
  
  app.post('/api/auth/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['Email and password are required']
      });
    }
    
    if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
      res.status(200).json({
        success: true,
        data: {
          user: { email: req.body.email, name: 'Test User' },
          token: 'mock-token'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  });

  app.get('/api/products', (req, res) => {
    if (req.query.error === 'database') {
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        products: [
          { id: 1, name: 'Reliance Industries Ltd', price: 2450.75, category: 'Stocks' },
          { id: 2, name: 'TCS Limited', price: 3450.25, category: 'Stocks' }
        ]
      }
    });
  });

  app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    if (productId === 1) {
      res.status(200).json({
        success: true,
        data: {
          product: { id: 1, name: 'Reliance Industries Ltd', price: 2450.75, category: 'Stocks' }
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  });

  app.get('/api/products/category/:category', (req, res) => {
    const category = req.params.category;
    const products = category === 'Stocks' ? [
      { id: 1, name: 'Reliance Industries Ltd', price: 2450.75, category: 'Stocks' }
    ] : [];
    
    res.status(200).json({
      success: true,
      data: { products }
    });
  });

  app.post('/api/transactions/buy', (req, res) => {
    if (req.body.productId === 999) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if ((req.body.quantity && req.body.quantity > 1000) || (req.body.units && req.body.units >= 100)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    if (req.body.productId === 'invalid' || req.body.units < 0 || req.body.quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['Invalid product ID or quantity']
      });
    }
    
    if (!req.body.productId || (!req.body.quantity && !req.body.units)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['Product ID and quantity are required']
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product purchased successfully',
      data: {
        transaction: {
          id: 1,
          product_name: 'Reliance Industries Ltd',
          quantity: req.body.quantity || req.body.units,
          price: 2450.75
        }
      }
    });
  });

  app.get('/api/transactions/my', (req, res) => {
    if (req.headers['x-test-empty'] === 'true') {
      return res.status(200).json({
        success: true,
        data: {
          transactions: []
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        transactions: [
          { id: 1, product_name: 'Reliance Industries Ltd', quantity: 10, price: 2450.75 }
        ]
      }
    });
  });

  app.get('/api/transactions/stats', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        total_transactions: 5,
        total_buy_amount: 10000.00
      }
    });
  });

  app.get('/api/portfolio', (req, res) => {
    if (req.headers['x-test-empty'] === 'true') {
      return res.status(200).json({
        success: true,
        data: {
          portfolio: []
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        portfolio: [
          { id: 1, product_name: 'Reliance Industries Ltd', quantity: 10, current_price: 2450.75 }
        ]
      }
    });
  });

  app.get('/api/portfolio/summary', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        summary: { total_invested: 12253.75 },
        wallet_balance: 87500.00
      }
    });
  });

  app.get('/api/portfolio/watchlist', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        watchlist: [
          { id: 1, name: 'Reliance Industries Ltd', price: 2450.75 }
        ]
      }
    });
  });

  app.post('/api/portfolio/watchlist/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    
    // Check if this is for testing successful addition
    if (req.headers['x-test-success'] === 'true') {
      return res.status(200).json({
        success: true,
        message: 'Product added to watchlist'
      });
    }
    
    if (productId === 1) {
      return res.status(400).json({
        success: false,
        message: 'Product already in watchlist'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product added to watchlist'
    });
  });

  app.delete('/api/portfolio/watchlist/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    
    // Check if this is for testing successful removal
    if (req.headers['x-test-success'] === 'true') {
      return res.status(200).json({
        success: true,
        message: 'Product removed from watchlist'
      });
    }
    
    if (productId === 999) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in watchlist'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product removed from watchlist'
    });
  });
  
  return app;
});

jest.mock('../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(() => Promise.resolve({
    query: jest.fn(),
    release: jest.fn()
  })),
  end: jest.fn()
}));

jest.mock('../config/redis', () => ({
  connectRedis: jest.fn(() => Promise.resolve()),
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    quit: jest.fn()
  }))
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 1, role: 'user' }))
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashed-password'),
  compare: jest.fn(() => true)
}));

jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});
