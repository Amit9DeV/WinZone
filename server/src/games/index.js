/**
 * Game Registry
 * Central hub for managing all games in the platform
 * Plug-and-play architecture: games register themselves here
 */

const Game = require('../models/Game.model');

// Game registry - stores game instances
const gameRegistry = {
  games: {},

  /**
   * Initialize game registry
   * Loads games from database and initializes game engines
   */
  async initialize(io) {
    try {
      console.log('🎮 Initializing Game Registry...');

      // Ensure default games exist in database
      await this.ensureDefaultGames();

      // Load enabled games from database
      const enabledGames = await Game.find({ enabled: true });

      // Initialize each game engine
      for (const game of enabledGames) {
        await this.registerGame(game.gameId, io);
      }

      console.log(`✅ Game Registry initialized: ${Object.keys(this.games).length} games active`);
    } catch (error) {
      console.error('❌ Failed to initialize game registry:', error);
    }
  },

  /**
   * Ensure default games exist in database
   */
  async ensureDefaultGames() {
    const defaultGames = [
      {
        gameId: 'aviator',
        name: 'Aviator',
        enabled: true,
        description: 'Crash game - bet and cash out before the plane flies away',
        minBet: 1,
        maxBet: 1000,
      },
      {
        gameId: 'ipl',
        name: 'IPL Toss',
        enabled: false, // Disabled by user request
        description: 'Predict the toss winner - Heads or Tails',
        minBet: 10,
        maxBet: 5000,
      },
      {
        gameId: 'dice',
        name: 'Dice',
        enabled: true,
        description: 'Provably Fair Dice - Over/Under',
        minBet: 1,
        maxBet: 10000,
      },
      {
        gameId: 'mines',
        name: 'Mines',
        enabled: true,
        description: 'Avoid the bombs, find the gems!',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'plinko',
        name: 'Plinko',
        enabled: true,
        description: 'Drop the ball and watch user win!',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'color-prediction',
        name: 'Color Prediction',
        enabled: true,
        description: 'Predict the color (Red/Green/Violet) or Number',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'triple-number',
        name: 'Triple Number',
        enabled: true,
        description: 'Pick 1, 2, or 3. Fast wins!',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'ludo',
        name: 'Ludo Express',
        enabled: true,
        description: 'Classic Ludo against Bots. Win to multiply!',
        minBet: 50,
        maxBet: 5000,
      },
      {
        gameId: 'coin-flip',
        name: 'Coin Flip',
        enabled: true,
        description: 'Heads or Tails? Double your money instantly!',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'wheel',
        name: '6-Color Wheel',
        enabled: true,
        description: 'Spin the wheel! Multipliers up to 5x!',
        minBet: 10,
        maxBet: 10000,
      },
      {
        gameId: 'slots',
        name: 'Classic Slots',
        enabled: true,
        description: 'Spin and Win! 777 Jackpot!',
        minBet: 10,
        maxBet: 5000,
      },
      {
        gameId: 'limbo',
        name: 'Limbo',
        enabled: true,
        description: 'Predict the multiplier! Win Big!',
        minBet: 1,
        maxBet: 10000,
      },
      {
        gameId: 'keno',
        name: 'Keno',
        enabled: true,
        description: 'Pick your lucky numbers! Up to 1000x!',
        minBet: 1,
        maxBet: 5000,
      },
    ];

    for (const gameData of defaultGames) {
      await Game.findOneAndUpdate(
        { gameId: gameData.gameId },
        gameData,
        { upsert: true, new: true }
      );
    }
  },

  /**
   * Register a game engine
   */
  async registerGame(gameId, io) {
    try {
      // Load game config from database
      const game = await Game.findOne({ gameId });
      if (!game) {
        throw new Error(`Game ${gameId} not found in database`);
      }

      if (!game.enabled) {
        console.log(`⏸️  Game ${gameId} is disabled, skipping...`);
        return;
      }

      // Dynamically load game engine
      let gameEngine;
      switch (gameId) {
        case 'aviator':
          gameEngine = require('./aviator/aviator.engine');
          break;
        case 'ipl':
          gameEngine = require('./ipl/ipl.engine');
          break;
        case 'dice':
          gameEngine = require('./dice/dice.engine');
          break;
        case 'mines':
          gameEngine = require('./mines/mines.engine');
          break;
        case 'plinko':
          gameEngine = require('./plinko/plinko.engine');
          break;
        case 'color-prediction':
          gameEngine = require('./color-prediction/color-prediction.engine');
          break;
        case 'triple-number':
          gameEngine = require('./triple-number/triple-number.engine');
          break;
        case 'ludo':
          gameEngine = require('./ludo/ludo.engine');
          break;
        case 'coin-flip':
          gameEngine = require('./coin-flip/coin-flip.engine');
          break;
        case 'wheel':
          gameEngine = require('./wheel/wheel.engine');
          break;
        case 'slots':
          gameEngine = require('./slots/slots.engine');
          break;
        case 'limbo':
          gameEngine = require('./limbo/limbo.engine');
          break;
        case 'keno':
          gameEngine = require('./keno/keno.engine');
          break;
        default:
          console.log(`⚠️  No engine found for game: ${gameId}`);
          return;
      }

      // Initialize game engine
      await gameEngine.initialize(io, game);

      // Register in memory
      this.games[gameId] = {
        engine: gameEngine,
        config: game,
      };

      console.log(`✅ Registered game: ${gameId}`);
    } catch (error) {
      console.error(`❌ Failed to register game ${gameId}:`, error);
    }
  },

  /**
   * Get all registered games
   */
  getGames() {
    return this.games;
  },

  /**
   * Get a specific game
   */
  getGame(gameId) {
    return this.games[gameId] || null;
  },

  /**
   * Check if game is enabled
   */
  async isGameEnabled(gameId) {
    const game = await Game.findOne({ gameId });
    return game && game.enabled;
  },

  /**
   * Enable/disable a game
   */
  async toggleGame(gameId, enabled) {
    const game = await Game.findOneAndUpdate(
      { gameId },
      { enabled },
      { new: true }
    );

    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }

    // If enabling, register the game
    if (enabled && !this.games[gameId]) {
      await this.registerGame(gameId, global.io);
    }

    // If disabling, stop the game engine
    if (!enabled && this.games[gameId]) {
      if (this.games[gameId].engine.stop) {
        await this.games[gameId].engine.stop();
      }
      delete this.games[gameId];
    }

    return game;
  },
};

module.exports = gameRegistry;


