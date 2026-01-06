/**
 * UserGameStats Model
 * Stores game-specific statistics for each user
 * Stats are updated at result time, not calculated on request
 */

const mongoose = require('mongoose');

const userGameStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    required: true,
    // Examples: 'aviator', 'ipl', 'dice'
  },
  totalBets: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  winPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalWagered: {
    type: Number,
    default: 0,
  },
  totalWon: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
userGameStatsSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('UserGameStats', userGameStatsSchema);

