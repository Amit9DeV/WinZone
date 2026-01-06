/**
 * Admin Routes
 * Admin-only operations
 */

const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const gameRegistry = require('../games/index');
const Game = require('../models/Game.model');
const walletService = require('../services/wallet.service');
const User = require('../models/User.model');
const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * Toggle game enable/disable
 * PUT /api/admin/games/:gameId/toggle
 */
router.put('/games/:gameId/toggle', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be a boolean',
      });
    }
    
    const game = await gameRegistry.toggleGame(gameId, enabled);
    
    res.json({
      success: true,
      data: game,
      message: `Game ${gameId} ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get all wallet requests
 * GET /api/admin/wallet/requests
 */
router.get('/wallet/requests', async (req, res) => {
  try {
    const requests = await walletService.getPendingRequests();
    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Approve wallet request
 * POST /api/admin/wallet/approve/:requestId
 */
router.post('/wallet/approve/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    
    const request = await walletService.approveRequest(requestId, req.userId, notes);
    
    res.json({
      success: true,
      data: request,
      message: 'Request approved',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Reject wallet request
 * POST /api/admin/wallet/reject/:requestId
 */
router.post('/wallet/reject/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    
    const request = await walletService.rejectRequest(requestId, req.userId, notes);
    
    res.json({
      success: true,
      data: request,
      message: 'Request rejected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get all users
 * GET /api/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email balance role totalBets totalWins totalLosses createdAt')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update user balance directly (admin)
 * POST /api/admin/users/:userId/balance
 */
router.post('/users/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;
    
    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number',
      });
    }
    
    const user = await walletService.updateBalance(
      userId,
      amount,
      reason || `Admin balance adjustment: ${amount > 0 ? '+' : ''}${amount}`
    );
    
    res.json({
      success: true,
      data: {
        userId: user._id,
        balance: user.balance,
      },
      message: 'Balance updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;

