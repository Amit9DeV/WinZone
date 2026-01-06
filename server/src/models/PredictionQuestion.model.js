/**
 * PredictionQuestion Model
 * Stores prediction questions for IPL (and future games)
 * States: OPEN → LOCKED → SETTLED
 */

const mongoose = require('mongoose');

const predictionQuestionSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    // Example: "Will Virat Kohli hit a SIX in the next over?"
  },
  options: {
    type: [String],
    required: true,
    // Example: ["Yes", "No"]
  },
  correctAnswer: {
    type: String,
    default: null,
    // Set when question is settled
  },
  status: {
    type: String,
    enum: ['OPEN', 'LOCKED', 'SETTLED'],
    default: 'OPEN',
  },
  lockTime: {
    type: Date,
    required: true,
    // When question locks (over starts)
  },
  settleTime: {
    type: Date,
    default: null,
    // When question is settled (over ends)
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
    // Over number, player name, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
predictionQuestionSchema.index({ matchId: 1, status: 1 });
predictionQuestionSchema.index({ status: 1, lockTime: 1 });
predictionQuestionSchema.index({ lockTime: 1 });

module.exports = mongoose.model('PredictionQuestion', predictionQuestionSchema);

