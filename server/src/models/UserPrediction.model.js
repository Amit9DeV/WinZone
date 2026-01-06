/**
 * UserPrediction Model
 * Stores user predictions for IPL questions
 */

const mongoose = require('mongoose');

const userPredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PredictionQuestion',
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
    // User's selected option
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
  result: {
    type: String,
    enum: ['PENDING', 'WON', 'LOST'],
    default: 'PENDING',
  },
  settledAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
userPredictionSchema.index({ userId: 1, createdAt: -1 });
userPredictionSchema.index({ questionId: 1, result: 1 });
userPredictionSchema.index({ matchId: 1 });

module.exports = mongoose.model('UserPrediction', userPredictionSchema);

