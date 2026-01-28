/**
 * Main Server Entry Point
 * Gaming Platform Backend - WinZO/Probo/Cricbuzz Style
 */

// FORCE DNS TO GOOGLE (Fixes local resolution issues)
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('✅ DNS forcefully set to Google DNS (8.8.8.8)');
} catch (error) {
  console.log('⚠️ Failed to set custom DNS:', error.message);
}

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
const rewardRoutes = require('./routes/reward.routes');
const adminRoutes = require('./routes/admin.routes');
const aviatorRoutes = require('./routes/aviator.routes');
const uploadRoutes = require('./routes/upload.routes');
const leaderboardRoutes = require('./routes/leaderboard');

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

// Health Check Endpoint (for cold start detection)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Rate Limiters
const { apiLimiter, authLimiter, betLimiter, walletLimiter } = require('./middleware/rateLimiter');

// API Routes
app.use('/api', apiLimiter); // Global API limit
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes); // Note: Bet rate limit should be applied inside game routes or where bets are placed
app.use('/api/wallet', walletLimiter, walletRoutes);
app.use('/api/reward', rewardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/aviator', aviatorRoutes);
const analyticsRoutes = require('./routes/analytics.routes');
app.use('/api/admin/analytics', analyticsRoutes);

const contentRoutes = require('./routes/content.routes');
app.use('/api/content', contentRoutes);

const promoRoutes = require('./routes/promo.routes');
app.use('/api/promo', promoRoutes);

app.use('/api/user', uploadRoutes);
app.use('/api', userRoutes); // Alias for /api/my-info compatibility - must be LAST
// Chat Routes (Compatibility with Client)
const chatRoutes = require('./routes/chat.routes');
// The client calls /api/get-all-chat directly (no prefix like /api/chat)
// So we mount it at /api/ directly or handle it inside the router
// The client code says: `${config.api}/get-all-chat`. 
// If config.api is https://winzone-final.onrender.com/api, then it calls https://winzone-final.onrender.com/api/get-all-chat
app.use('/api', chatRoutes);

const friendsRoutes = require('./routes/friends.routes');
app.use('/api/friends', friendsRoutes);

// Initialize Socket.IO
const io = initSocket(server);

// Make io available globally for game engines
global.io = io;

// Initialize Chat Handler
const chatHandler = require('./socket/chat.handler');
chatHandler.initialize(io);

const leaderboardService = require('./services/leaderboard.service');

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  console.log('========================================');
  console.log('🚀 Gaming Platform Backend Started');
  console.log('========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Initialize Game Registry
    await gameRegistry.initialize(io);
    console.log(`🎮 Game Registry: ${Object.keys(gameRegistry.getGames()).length} games initialized`);

    // Initialize Bot Service
    const botService = require('./services/bot.service');
    botService.initialize(io);
    console.log('🤖 Bot Service Initialized');

    // Leaderboard Updater (Every 1 minute)
    setInterval(() => {
      leaderboardService.updateLeaderboard('daily');
      leaderboardService.updateLeaderboard('weekly');
      leaderboardService.updateLeaderboard('monthly');
      // console.log('Leaderboards updated.'); // Optional: log when leaderboards are updated
    }, 60 * 1000);
    console.log('📊 Leaderboard updater started (every 1 minute)');

    console.log('========================================');
  } catch (error) {
    console.error('❌ Failed to start server components:', error);
    process.exit(1);
  }
});

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

module.exports = { app, server };

