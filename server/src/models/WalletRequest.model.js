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
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL'],
    required: true,
    default: 'DEPOSIT' // For backward compatibility
  },
  // For Deposits
  utr: {
    type: String,
    trim: true,
  },
  // For Withdrawals
  upiId: {
    type: String,
    trim: true,
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
    type: String, // Changed from ObjectId to String to support 'admin' ID
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

