/**
 * Main Server Entry Point
 * Gaming Platform Backend - WinZO/Probo/Cricbuzz Style
 * 
 * Architecture:
 * - Express.js for REST APIs
 * - Socket.IO for real-time game updates
 * - MongoDB for data persistence
 * - Modular game system (plug-and-play games)
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { initSocket } = require('./config/socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const gameRoutes = require('./routes/game.routes');
const adminRoutes = require('./routes/admin.routes');
const aviatorRoutes = require('./routes/aviator.routes');
const uploadRoutes = require('./routes/upload.routes');

// Import game engines
const gameRegistry = require('./games/index');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: true, // Allow ANY origin
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatars)
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/user', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/aviator', aviatorRoutes);
app.use('/api', userRoutes); // Alias for /api/my-info compatibility - must be LAST
// Chat Routes (Compatibility with Client)
const chatRoutes = require('./routes/chat.routes');
// The client calls /api/get-all-chat directly (no prefix like /api/chat)
// So we mount it at /api/ directly or handle it inside the router
// The client code says: `${config.api}/get-all-chat`. 
// If config.api is http://localhost:5001/api, then it calls http://localhost:5001/api/get-all-chat
app.use('/api', chatRoutes);

// Initialize Socket.IO
const io = initSocket(server);

// Make io available globally for game engines
global.io = io;

// Initialize game registry and start game engines
gameRegistry.initialize(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log('========================================');
      console.log('🚀 Gaming Platform Backend Started');
      console.log('========================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎮 Game Registry: ${Object.keys(gameRegistry.getGames()).length} games`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, server };

