/**
 * User Model
 * Stores user profile, balance, and overall statistics
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // Note: In production, this should be hashed
    // For demo purposes, storing plain text
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Overall statistics (calculated and stored)
  totalBets: {
    type: Number,
    default: 0,
  },
  totalWins: {
    type: Number,
    default: 0,
  },
  totalWon: {
    type: Number,
    default: 0,
  },
  totalLosses: {
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
  biggestWin: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Allow null/unique
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  // Risk & Fraud Detection
  riskProfile: {
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    flags: [{ type: String }], // e.g. 'MULTI_IP', 'BOT_RATE', 'WALLET_SPIKE'
    lastPlayedIp: { type: String },
    suspiciousActivityCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
});

// Index for referral lookups
userSchema.index({ referralCode: 1 });

// Helper to generate referral code
userSchema.methods.generateReferralCode = function () {
  // Basic Ref Code: First 4 chars of name (or random) + random number
  const base = this.name ? this.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'USER') : 'USER';
  const random = Math.floor(1000 + Math.random() * 9000);
  this.referralCode = `${base}${random}`;
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);


