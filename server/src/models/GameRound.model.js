/**
 * GameRound Model
 * Stores round/round data for games (Aviator, Dice, etc.)
 */

const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  game: {
    type: String,
    required: true,
    // 'aviator', 'dice', etc.
  },
  roundId: {
    type: String,
    required: true,
    unique: true,
  },
  crashMultiplier: {
    type: Number,
    default: null,
    // For Aviator: the multiplier at which it crashed
  },
  status: {
    type: String,
    enum: ['WAITING', 'FLYING', 'CRASHED', 'COMPLETED'],
    default: 'WAITING',
  },
  startedAt: {
    type: Date,
    default: null,
  },
  crashedAt: {
    type: Date,
    default: null,
  },
  totalBets: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Additional round data
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
gameRoundSchema.index({ game: 1, createdAt: -1 });
gameRoundSchema.index({ roundId: 1 });
gameRoundSchema.index({ status: 1 });

module.exports = mongoose.model('GameRound', gameRoundSchema);

