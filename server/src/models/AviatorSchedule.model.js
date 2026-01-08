/**
 * AviatorSchedule Model
 * Admin can schedule one-time crashes at specific dates/times
 * Each schedule executes only once, then marked as used
 */

const mongoose = require('mongoose');

const aviatorScheduleSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    // Format: YYYY-MM-DD
  },
  time: {
    type: String,
    required: true,
    // Format: HH:MM (24-hour)
  },
  crashAt: {
    type: Number,
    required: true,
    min: 1.01,
    // Multiplier at which to crash (e.g., 100x)
  },
  used: {
    type: Boolean,
    default: false,
  },
  executedAt: {
    type: Date,
    default: null,
  },
  roundId: {
    type: String,
    default: null,
    // Round ID when schedule was executed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
aviatorScheduleSchema.index({ date: 1, time: 1 });
aviatorScheduleSchema.index({ used: 1, date: 1, time: 1 });

module.exports = mongoose.model('AviatorSchedule', aviatorScheduleSchema);


