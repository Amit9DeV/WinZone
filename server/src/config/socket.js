/**
 * Socket.IO Configuration
 * Handles WebSocket connections for real-time game updates
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
const initSocket = (server) => {
  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'];

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'], // Polling first for better compatibility
    allowEIO3: true, // Allow Engine.IO v3 clients
  });

  // Connection middleware - authenticate users
  io.use((socket, next) => {
    // For demo purposes, we'll allow connections
    // In production, verify JWT token here
    const token = socket.handshake.auth.token;
    socket.userId = socket.handshake.query.userId || null;
    next();
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (User: ${socket.userId || 'Anonymous'})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket() first.');
  }
  return io;
};

module.exports = { initSocket, getIO };

