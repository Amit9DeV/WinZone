/**
 * UserActivity Model
 * Timeline of user actions: bets, wins, losses, predictions
 * Used for activity feed and history
 */

const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    required: true,
    // Examples: 'aviator', 'ipl'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'BET_PLACED',
      'BET_WON',
      'BET_LOST',
      'CASHOUT',
      'PREDICTION_PLACED',
      'PREDICTION_WON',
      'PREDICTION_LOST',
      'WALLET_DEPOSIT',
      'WALLET_WITHDRAWAL',
    ],
  },
  title: {
    type: String,
    required: true,
    // Example: "Aviator Bet", "IPL Prediction: Will Kohli hit a six?"
  },
  description: {
    type: String,
    default: '',
    // Example: "Bet placed on round #12345"
  },
  amount: {
    type: Number,
    default: 0,
    // Bet amount or transaction amount
  },
  payout: {
    type: Number,
    default: 0,
    // Amount won (0 if lost)
  },
  balanceAfter: {
    type: Number,
    required: true,
    // User balance after this activity
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Additional data: roundId, questionId, multiplier, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ userId: 1, gameId: 1, createdAt: -1 });
userActivitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);

