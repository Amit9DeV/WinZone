/**
 * WalletRequest Model
 * Users request balance (deposit), admin approves
 */

const mongoose = require('mongoose');

const walletRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  processedAt: {
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
walletRequestSchema.index({ userId: 1, status: 1 });
walletRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WalletRequest', walletRequestSchema);

