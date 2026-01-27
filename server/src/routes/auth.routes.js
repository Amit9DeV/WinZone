/**
 * Authentication Routes
 * Login, register, token refresh
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const router = express.Router();

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Handle Referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        referrer.referralCount += 1;
        await referrer.save();
      }
    }

    // Create user (password stored as plain text for demo)
    const user = new User({
      name,
      email,
      password, // In production, hash this
      role: 'USER',
      balance: 0,
      referredBy
    });

    // Generate own referral code
    user.generateReferralCode();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Login
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required',
      });
    }

    // Check for Admin Login
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminUser && password === adminPass) {
      const token = jwt.sign(
        { userId: 'admin', role: 'ADMIN' },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        data: {
          user: {
            _id: 'admin',
            name: 'Admin',
            email: adminUser,
            balance: 0,
            role: 'ADMIN',
          },
          token,
        },
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password (plain text comparison for demo)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Verify token
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');

    if (decoded.role === 'ADMIN') {
      return res.json({
        success: true,
        data: {
          user: {
            _id: 'admin',
            name: 'Admin',
            email: process.env.ADMIN_USERNAME || 'admin',
            balance: 0,
            role: 'ADMIN',
          },
        },
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
});

module.exports = router;


