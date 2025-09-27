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
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5001;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({  
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
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

const startServer = async () => {
  try {
    await connectRedis();
    
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
