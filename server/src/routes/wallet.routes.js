/**
 * Wallet Routes
 * Balance, deposits, withdrawals
 */

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const walletService = require('../services/wallet.service');
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get balance
 * GET /api/wallet/balance
 */
router.get('/balance', async (req, res) => {
  try {
    const balance = await walletService.getBalance(req.userId);
    res.json({
      success: true,
      data: { balance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Deposit Request
 * POST /api/wallet/deposit
 */
router.post('/deposit', async (req, res) => {
  try {
    const { amount, utr } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    if (!utr) {
      return res.status(400).json({ success: false, message: 'UTR number is required' });
    }

    const request = await walletService.createDepositRequest(req.userId, amount, utr);

    res.json({
      success: true,
      data: request,
      message: 'Deposit request submitted. Verification pending.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Withdrawal Request
 * POST /api/wallet/withdraw
 */
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, upiId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    if (!upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required' });
    }

    const request = await walletService.createWithdrawalRequest(req.userId, amount, upiId);

    res.json({
      success: true,
      data: request,
      message: 'Withdrawal request submitted.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get user's wallet requests (History)
 * GET /api/wallet/requests
 */
router.get('/requests', async (req, res) => {
  try {
    const requests = await walletService.getUserRequests(req.userId);
    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
