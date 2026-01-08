/**
 * Game Model
 * Registry of all games in the platform
 * Admin can enable/disable games
 */

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // Examples: 'aviator', 'ipl', 'dice'
  },
  name: {
    type: String,
    required: true,
    // Display name: "Aviator", "IPL Predictions", "Dice Roll"
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  minBet: {
    type: Number,
    default: 1,
  },
  maxBet: {
    type: Number,
    default: 1000,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Game-specific configuration
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index
gameSchema.index({ enabled: 1 });
gameSchema.index({ gameId: 1 });

module.exports = mongoose.model('Game', gameSchema);


