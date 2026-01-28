/**
 * MongoDB Database Connection
 * Handles connection to MongoDB with error handling and reconnection logic
 */

const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const mongoURI = "mongodb+srv://kumararyanbhai90_db_user:OLWWaYG0UFYFlfJW@cluster0.ohypbqc.mongodb.net/WinZone?appName=Cluster0";

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      family: 4,
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
    console.error('Make sure your IP is whitelisted in MongoDB Atlas or try using a different network/DNS.');
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

module.exports = { connectDB, mongoose };
