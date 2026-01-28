const rateLimit = require('express-rate-limit');

// General API Rate Limiter (1000 req per 15 min)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// Strict Auth Limiter (50 req per hour for login/register)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts, please try again in an hour.'
    }
});

// Bet Placement Limiter (120 bets per minute)
const betLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 120, // 2 bets per second allowed
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Betting too fast! Please slow down.'
    }
});

// Wallet Request Limiter (Poll friendly - 1000 req per hour)
const walletLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'Too many wallet requests.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    betLimiter,
    walletLimiter
};
