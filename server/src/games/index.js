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
        name: 'IPL Predictions',
        enabled: false, // Will be enabled in Step 6
        description: 'Predict IPL match outcomes and live events',
        minBet: 10,
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

