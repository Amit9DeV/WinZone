/**
 * Game Routes
 * Game lobby, list games, game info
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const Game = require('../models/Game.model');
const gameRegistry = require('../games/index');
const router = express.Router();

/**
 * Get all available games (lobby)
 * GET /api/games
 */
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ enabled: true })
      .select('gameId name description icon minBet maxBet')
      .sort({ name: 1 });

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
 * Get recent bets (Live Feed History)
 * GET /api/games/recent-bets
 */
router.get('/recent-bets', async (req, res) => {
  try {
    const Bet = require('../models/Bet.model');
    const bets = await Bet.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name');

    const formattedBets = bets.map(bet => ({
      id: bet._id,
      username: bet.userId ? bet.userId.name : 'Unknown',
      game: bet.gameId,
      amount: bet.amount,
      won: bet.result === 'WON',
      payout: bet.payout,
      multiplier: bet.multiplier
    }));

    res.json({
      success: true,
      data: formattedBets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get game details
 * GET /api/games/:gameId
 */
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ gameId, enabled: true });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get game state (for authenticated users)
 * GET /api/games/:gameId/state
 */
router.get('/:gameId/state', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = gameRegistry.getGame(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found or not active',
      });
    }

    // Get current game state from engine
    if (game.engine.getState) {
      const state = await game.engine.getState();
      return res.json({
        success: true,
        data: state,
      });
    }

    res.json({
      success: true,
      data: { status: 'active' },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



module.exports = router;


