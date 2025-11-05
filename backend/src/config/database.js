const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 
  `mongodb+srv://${process.env.DB_USER || 'admin'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'cluster0.mongodb.net'}/${process.env.DB_NAME || 'trading_app'}?retryWrites=true&w=majority`;

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, options);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
