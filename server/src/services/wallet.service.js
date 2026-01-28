/**
 * Wallet Service
 * Handles user balance operations, deposits, withdrawals
 */

const User = require('../models/User.model');
const WalletRequest = require('../models/WalletRequest.model');
const UserActivity = require('../models/UserActivity.model');
const { getIO } = require('../config/socket');

const walletService = {
  /**
   * Get user balance
   */
  async getBalance(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.balance;
  },

  /**
   * Update user balance (internal use)
   */
  async updateBalance(userId, amount, reason = '') {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = user.balance + amount;
    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    user.balance = newBalance;
    await user.save();

    // Emit real-time update
    this.emitBalanceUpdate(userId, newBalance);

    // Log activity
    await UserActivity.create({
      userId,
      gameId: 'wallet',
      type: amount > 0 ? 'WALLET_DEPOSIT' : 'WALLET_WITHDRAWAL',
      title: reason || (amount > 0 ? 'Balance Added' : 'Balance Deducted'),
      description: `Balance ${amount > 0 ? 'added' : 'deducted'}: ${Math.abs(amount)}`,
      amount: Math.abs(amount),
      payout: 0,
      balanceAfter: newBalance,
    });

    return user;
  },

  /**
   * Helper to emit balance update
   */
  emitBalanceUpdate(userId, balance) {
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('user:balance', balance);
        console.log(`📡 Emitted balance update for ${userId}: ${balance}`);
      }
    } catch (error) {
      console.error('Socket emit error:', error.message);
    }
  },

  /**
   * Create Deposit Request
   */
  async createDepositRequest(userId, amount, utr) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    if (!utr) throw new Error('UTR number is required for verification');

    // Check strict rate limit for deposits manually if needed? 
    // Handled by route limiter.

    const request = await WalletRequest.create({
      userId,
      amount,
      type: 'DEPOSIT',
      utr,
      status: 'PENDING',
    });

    return request;
  },

  /**
   * Create Withdrawal Request
   * IMMEDIATELY DEDUCTS BALANCE
   */
  async createWithdrawalRequest(userId, amount, upiId) {
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    if (!upiId) throw new Error('UPI ID is required');

    const user = await User.findById(userId);
    if (user.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct balance immediately
    await this.updateBalance(userId, -amount, `Withdrawal Request to ${upiId}`);

    const request = await WalletRequest.create({
      userId,
      amount,
      type: 'WITHDRAWAL',
      upiId,
      status: 'PENDING',
    });

    return request;
  },

  /**
   * Approve wallet request (admin only)
   */
  async approveRequest(requestId, adminId, notes = '') {
    const request = await WalletRequest.findById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Request already processed');
    }

    // Handle Logic based on Type
    if (request.type === 'DEPOSIT') {
      // Add balance for Approved Deposit
      await this.updateBalance(
        request.userId,
        request.amount,
        `Deposit Approved (UTR: ${request.utr})`
      );
    } else {
      // For Withdrawal, money was already deducted. 
      // Just mark as approved (Admin has sent the money manually via UPI)
      // Optionally, we could log a 'Withdrawal Processed' activity.
    }

    // Update request
    request.status = 'APPROVED';
    request.processedBy = adminId;
    request.processedAt = new Date();
    request.adminNotes = notes;
    await request.save();

    return request;
  },

  /**
   * Reject wallet request (admin only)
   */
  async rejectRequest(requestId, adminId, notes = '') {
    const request = await WalletRequest.findById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Request already processed');
    }

    // Handle Logic based on Type
    if (request.type === 'WITHDRAWAL') {
      // Refund the money for Rejected Withdrawal
      await this.updateBalance(
        request.userId,
        request.amount,
        `Withdrawal Refund (Rejected)`
      );
    }

    request.status = 'REJECTED';
    request.processedBy = adminId;
    request.processedAt = new Date();
    request.adminNotes = notes;
    await request.save();

    return request;
  },

  /**
   * Get pending requests
   */
  async getPendingRequests() {
    return WalletRequest.find({ status: 'PENDING' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  },

  /**
   * Get user's wallet requests
   */
  async getUserRequests(userId) {
    return WalletRequest.find({ userId })
      .sort({ createdAt: -1 });
  },

  /**
   * Get request history (Approved/Rejected)
   */
  async getRequestHistory() {
    return WalletRequest.find({ status: { $in: ['APPROVED', 'REJECTED'] } })
      .populate('userId', 'name email')
      .populate('processedBy', 'name')
      .sort({ processedAt: -1 })
      .limit(100);
  },
};

module.exports = walletService;
