/**
 * Bet Model
 * Stores all bets placed by users across all games
 */

const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    required: true,
    // 'aviator', 'ipl', etc.
  },
  roundId: {
    type: String,
    default: null,
    // For Aviator: round ID
    // For IPL: question ID
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payout: {
    type: Number,
    default: 0,
    // Amount won (0 if lost)
  },
  multiplier: {
    type: Number,
    default: null,
    // For Aviator: multiplier at cashout
  },
  result: {
    type: String,
    enum: ['PENDING', 'WON', 'LOST', 'CANCELLED'],
    default: 'PENDING',
  },
  cashedOut: {
    type: Boolean,
    default: false,
  },
  cashedOutAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    // Additional bet data: target multiplier, prediction option, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ gameId: 1, roundId: 1 });
betSchema.index({ roundId: 1, result: 1 });
betSchema.index({ result: 1, createdAt: -1 });

module.exports = mongoose.model('Bet', betSchema);

