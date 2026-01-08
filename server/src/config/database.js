/**
 * MongoDB Database Connection
 * Handles connection to MongoDB with error handling and reconnection logic
 */

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winzone';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

module.exports = { connectDB, mongoose };


