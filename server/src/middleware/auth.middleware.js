/**
 * Authentication Middleware
 * Simple JWT-based auth for demo purposes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
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
      req.user = {
        _id: 'admin',
        name: 'Admin',
        email: process.env.ADMIN_USERNAME || 'admin',
        role: 'ADMIN',
        balance: 0
      };
      req.userId = 'admin';
      return next();
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

module.exports = { authenticate, isAdmin };


