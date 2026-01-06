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
 * Request balance (deposit)
 * POST /api/wallet/request
 */
router.post('/request', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }
    
    const request = await walletService.requestBalance(req.userId, amount);
    
    res.json({
      success: true,
      data: request,
      message: 'Balance request submitted. Waiting for admin approval.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get user's wallet requests
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

