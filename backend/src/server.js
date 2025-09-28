const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { connectRedis } = require('./config/redis');
const pool = require('./config/database');

const authRoutes = require('./routes/auth');
const kycRoutes = require('./routes/kyc');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const auditRoutes = require('./routes/audit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL,
          /^https:\/\/mini-app-frontend.*\.vercel\.app$/
        ].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5001;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({  
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        /^https:\/\/mini-app-frontend.*\.vercel\.app$/
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected via WebSocket`);
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle price updates subscription
  socket.on('subscribe_prices', (productIds) => {
    if (Array.isArray(productIds)) {
      productIds.forEach(productId => {
        socket.join(`product_${productId}`);
      });
    }
  });
  
  // Handle price updates unsubscription
  socket.on('unsubscribe_prices', (productIds) => {
    if (Array.isArray(productIds)) {
      productIds.forEach(productId => {
        socket.leave(`product_${productId}`);
      });
    }
  });
  
  // Handle order updates subscription
  socket.on('subscribe_orders', () => {
    socket.join(`orders_${socket.userId}`);
  });
  
  // Handle notifications subscription
  socket.on('subscribe_notifications', () => {
    socket.join(`notifications_${socket.userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected from WebSocket`);
  });
});

// Make io available to other modules
app.set('io', io);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');
    
    // Check if tables exist by trying to query users table
    await pool.query('SELECT 1 FROM users LIMIT 1');
    console.log('✅ Database tables already exist');
    return true;
  } catch (error) {
    if (error.code === '42P01') { // relation does not exist
      console.log('📋 Creating database tables...');
      
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(15),
          role VARCHAR(20) DEFAULT 'user',
          wallet_balance DECIMAL(15,2) DEFAULT 100000.00,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create products table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          symbol VARCHAR(20) UNIQUE NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          current_price DECIMAL(15,2) NOT NULL,
          previous_close DECIMAL(15,2) DEFAULT 0,
          market_cap DECIMAL(20,2) DEFAULT 0,
          volume BIGINT DEFAULT 0,
          pe_ratio DECIMAL(10,2),
          risk_level VARCHAR(20) DEFAULT 'medium',
          min_investment DECIMAL(15,2) DEFAULT 1000.00,
          max_investment DECIMAL(15,2),
          is_active BOOLEAN DEFAULT true,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create transactions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
          quantity DECIMAL(15,4) NOT NULL CHECK (quantity > 0),
          price DECIMAL(15,2) NOT NULL CHECK (price > 0),
          total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
          transaction_date TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create portfolio table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS portfolio (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
          average_price DECIMAL(15,2) NOT NULL DEFAULT 0,
          total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        )
      `);

      // Create watchlist table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS watchlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        )
      `);

      console.log('✅ Database tables created successfully');
      return false; // Tables were created, need to seed data
    } else {
      throw error;
    }
  }
};

const seedInitialData = async () => {
  try {
    console.log('🌱 Seeding initial data...');
    
    // Check if admin user exists
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@tradingapp.com']);
    
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create admin user
      await pool.query(`
        INSERT INTO users (name, email, password, role, wallet_balance)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin User', 'admin@tradingapp.com', hashedPassword, 'admin', 1000000]);

      // Create sample user
      const userPassword = await bcrypt.hash('password123', 12);
      await pool.query(`
        INSERT INTO users (name, email, password, role, wallet_balance)
        VALUES ($1, $2, $3, $4, $5)
      `, ['John Doe', 'john@example.com', userPassword, 'user', 100000]);

      console.log('✅ Initial users created');
    }

    // Check if products exist
    const productCheck = await pool.query('SELECT id FROM products LIMIT 1');
    
    if (productCheck.rows.length === 0) {
      // Create sample products
      await pool.query(`
        INSERT INTO products (name, symbol, description, category, current_price, previous_close, risk_level, min_investment)
        VALUES 
        ('Apple Inc.', 'AAPL', 'Technology company known for iPhone, Mac, and services', 'Stocks', 175.50, 174.25, 'medium', 1000),
        ('Microsoft Corporation', 'MSFT', 'Technology company focused on cloud computing and productivity software', 'Stocks', 378.85, 375.20, 'medium', 1000),
        ('Gold ETF', 'GOLD', 'Exchange-traded fund that tracks the price of gold', 'ETFs', 45.30, 44.80, 'low', 500),
        ('Bitcoin', 'BTC', 'Digital cryptocurrency', 'Crypto', 43250.00, 42800.00, 'high', 10000)
      `);

      console.log('✅ Sample products created');
    }

    console.log('✅ Initial data seeding completed');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
  }
};

const startServer = async () => {
  try {
    // Connect to Redis if available
    try {
      await connectRedis();
      console.log('✅ Connected to Redis');
    } catch (redisError) {
      console.log('⚠️  Redis connection failed, continuing without Redis:', redisError.message);
    }

    // Initialize database
    const tablesExisted = await initializeDatabase();
    if (!tablesExisted) {
      await seedInitialData();
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
