/**
 * User Routes
 * Profile, stats, activity
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const userStatsService = require('../services/userStats.service');
const activityService = require('../services/activity.service');
const router = express.Router();

/**
 * Get user bet history (for Aviator frontend compatibility)
 * POST /api/users/my-info
 */
router.post('/my-info', async (req, res) => {
  try {
    const { name } = req.body;
    const Bet = require('../models/Bet.model');
    const User = require('../models/User.model');

    // Find user by name if provided, otherwise use authenticated user
    let user;
    if (name) {
      user = await User.findOne({ name });
    } else {
      user = req.user;
    }

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    // Get user's recent bets (limit to 50 most recent)
    const bets = await Bet.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Format bets for Aviator frontend
    const formattedBets = bets.map(bet => ({
      _id: bet._id,
      betAmount: bet.amount,
      cashoutAt: bet.multiplier || 0,
      flyAway: bet.metadata?.crashMultiplier || 0,
      payout: bet.payout || 0,
      result: bet.result,
      cashedOut: bet.cashedOut,
      createdAt: bet.createdAt,
      flyDetailID: bet.roundId,
      gameId: bet.gameId,
    }));

    res.json({
      status: true,
      data: formattedBets,
    });
  } catch (error) {
    console.error('my-info error:', error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

/**
 * Get top bets for day/month/year (public)
 */
const getTopBets = async (req, res, period) => {
  try {
    const Bet = require('../models/Bet.model');

    let startTime = new Date();
    if (period === 'day') {
      startTime.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startTime.setDate(1);
      startTime.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      startTime.setMonth(0, 1);
      startTime.setHours(0, 0, 0, 0);
    }

    const bets = await Bet.find({
      gameId: 'aviator',
      result: 'WON',
      createdAt: { $gte: startTime }
    })
      .sort({ payout: -1 }) // Sort by highest win amount
      .limit(20)
      .populate('userId', 'name avatar')
      .lean();

    const data = bets.map(bet => ({
      userinfo: [{
        userName: bet.userId ? bet.userId.name : 'Unknown',
        avatar: bet.userId ? bet.userId.avatar : ''
      }],
      betAmount: bet.amount,
      cashoutAt: bet.multiplier,
      createdAt: bet.createdAt
    }));

    res.json({
      status: true,
      data: data
    });
  } catch (error) {
    console.error(`get-${period}-history error:`, error);
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

router.get('/get-day-history', (req, res) => getTopBets(req, res, 'day'));
router.get('/get-month-history', (req, res) => getTopBets(req, res, 'month'));
router.get('/get-year-history', (req, res) => getTopBets(req, res, 'year'));

// All routes require authentication
router.use(authenticate);

/**
 * Update user profile
 * PUT /api/users/profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const User = require('../models/User.model');
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          role: user.role,
          avatar: user.avatar,
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get user profile
 * GET /api/users/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const stats = await userStatsService.getUserStats(req.userId);

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          balance: req.user.balance,
          role: req.user.role,
          avatar: req.user.avatar,
        },
        stats: stats.overall,
        gameStats: stats.games,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get user stats
 * GET /api/users/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await userStatsService.getUserStats(req.userId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get game-specific stats
 * GET /api/users/stats/:gameId
 */
router.get('/stats/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const stats = await userStatsService.getGameStats(req.userId, gameId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get user activity feed
 * GET /api/users/activity
 */
router.get('/activity', async (req, res) => {
  try {
    const {
      gameId = null,
      limit = parseInt(req.query.limit) || 50,
      skip = parseInt(req.query.skip) || 0,
      type = null,
    } = req.query;

    const activities = await activityService.getUserActivity(req.userId, {
      gameId,
      limit,
      skip,
      type,
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



/**
 * Get user bet history (generic)
 * GET /api/users/bets
 */
router.get('/bets', async (req, res) => {
  try {
    const Bet = require('../models/Bet.model');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bets = await Bet.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip) // Pagination
      .limit(limit)
      .lean();

    const total = await Bet.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      data: {
        bets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;


