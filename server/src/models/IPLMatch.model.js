/**
 * IPLMatch Model
 * Stores IPL match information
 */

const mongoose = require('mongoose');

const iplMatchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true,
    // External API match ID or custom ID
  },
  team1: {
    type: String,
    required: true,
  },
  team2: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
  // Live match data (updated from cricket API)
  liveData: {
    score: {
      team1: { runs: Number, wickets: Number, overs: Number },
      team2: { runs: Number, wickets: Number, overs: Number },
    },
    currentBatsman: String,
    currentBowler: String,
    lastUpdate: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
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

// Indexes
iplMatchSchema.index({ matchId: 1 });
iplMatchSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('IPLMatch', iplMatchSchema);


