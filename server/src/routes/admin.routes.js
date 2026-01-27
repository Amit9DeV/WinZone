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
const Settings = require('../models/Settings');
const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * Get all games (admin view)
 * GET /api/admin/games
 */
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ name: 1 });
    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

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
 * Update game configuration
 * PUT /api/admin/games/:gameId/config
 */
router.put('/games/:gameId/config', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { minBet, maxBet, metadata } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    if (minBet !== undefined) game.minBet = minBet;
    if (maxBet !== undefined) game.maxBet = maxBet;
    if (metadata !== undefined) game.metadata = { ...game.metadata, ...metadata };

    await game.save();

    // Notify game engine if needed (implementation depends on engine architecture)
    // For now, simpler engines might need a restart or polling, but DB is source of truth.

    res.json({
      success: true,
      data: game,
      message: 'Game configuration updated'
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

/**
 * Get system settings
 * GET /api/admin/settings
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update system settings
 * PUT /api/admin/settings
 */
router.put('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get dashboard stats
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const [users, totalDeposit, activeGames, pendingRequests] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
      Game.countDocuments({ enabled: true }),
      walletService.getPendingRequests().then(reqs => reqs.length)
    ]);

    // Mock chart data (replace with real aggregation if needed)
    const chartData = [
      { name: 'Mon', revenue: 4000, users: 240 },
      { name: 'Tue', revenue: 3000, users: 139 },
      { name: 'Wed', revenue: 2000, users: 980 },
      { name: 'Thu', revenue: 2780, users: 390 },
      { name: 'Fri', revenue: 1890, users: 480 },
      { name: 'Sat', revenue: 2390, users: 380 },
      { name: 'Sun', revenue: 3490, users: 430 },
    ];

    res.json({
      success: true,
      data: {
        totalUsers: users,
        totalDeposits: totalDeposit[0]?.total || 0,
        activeGames,
        pendingRequests,
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Toggle user ban status
 * PUT /api/admin/users/:userId/status
 */
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { banned } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isBanned: banned }, { new: true });

    res.json({
      success: true,
      message: `User ${banned ? 'banned' : 'unbanned'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get wallet history (Approved/Rejected)
 * GET /api/admin/wallet/history
 */
router.get('/wallet/history', async (req, res) => {
  try {
    // Assuming walletService has a method or we query directly
    // For now, let's mock or query if model available. 
    // Since walletService handles logic, we might need to extend it or query model directly.
    // Let's assume we query the WalletRequest model directly if exported, or add to service.
    // For simplicity, let's just return empty array or implement in service.
    // I'll implement a basic query here assuming WalletRequest model is accessible via service or direct.
    // Actually, let's add getHistory to walletService in next step.
    const requests = await walletService.getRequestHistory();
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get Risk Dashboard Data
 * GET /api/admin/risk/dashboard
 */
router.get('/risk/dashboard', async (req, res) => {
  try {
    const riskService = require('../services/risk.service');
    const [whales, alerts] = await Promise.all([
      riskService.getWhales(),
      riskService.getRiskAlerts()
    ]);

    res.json({
      success: true,
      data: { whales, alerts }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


