/**
 * Fraud Detection Service
 * Analyzes betting patterns and player behavior for suspicious activity.
 */

const User = require('../models/User.model');
// const redis = require('../config/redis'); // Redis disabled for demo (using in-memory Map) 
// If Redis not available, we use memory map for demo, but Redis is better for distributed.
// For now, let's assume we can use simple in-memory or DB lookups.
// To keep it robust without heavy infra dependencies for this demo, I'll use DB + fast checks.

class FraudService {
    constructor() {
        this.checks = {
            BOT_RATE: { threshold: 10, interval: 1000 }, // 10 bets per second
            HIGH_WIN_RATE: { threshold: 90, minBets: 20 }, // 90% win rate over 20 bets
            WALLET_SPIKE: { multiplier: 5, timeframe: 3600000 } // 5x balance increase in 1 hour
        };
        // In-memory request tracker for rate limiting (Bot detection)
        this.betRateTracker = new Map();
    }

    /**
     * Analyze a user's bet for fraud
     * @param {String} userId - User ID
     * @param {Object} betData - Details of the bet
     * @param {String} ip - Client IP address
     * @returns {Object} riskResult { score: Number, flags: Array }
     */
    async analyzeBet(userId, betData, ip) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            const flags = [];
            let score = user.riskProfile?.riskScore || 0;

            // 1. IP Tracking & Multi-Account Check (Async)
            this.checkIp(user, ip).then(ipFlag => {
                if (ipFlag) this.addFlag(user, ipFlag);
            });

            // 2. Bot Rate Check (Sync - Blocking)
            if (this.isBotBehavior(user._id)) {
                flags.push('BOT_RATE');
                score += 20;
            }

            // Update User if risk increases
            if (flags.length > 0) {
                await this.updateRiskProfile(user, flags, score);
            }

            return { score, flags };
        } catch (error) {
            console.error('Fraud Analysis Error:', error);
        }
    }

    /**
     * Check rate of bets (Bot Detection)
     */
    isBotBehavior(userId) {
        const now = Date.now();
        const userKey = userId.toString();

        let history = this.betRateTracker.get(userKey) || [];
        // Filter requests within last second
        history = history.filter(time => now - time < this.checks.BOT_RATE.interval);

        history.push(now);
        this.betRateTracker.set(userKey, history);

        return history.length > this.checks.BOT_RATE.threshold;
    }

    /**
     * Check if IP is shared by many users
     */
    async checkIp(user, ip) {
        if (!ip) return null;

        // Update user's IP if changed
        if (user.riskProfile?.lastPlayedIp !== ip) {
            user.riskProfile.lastPlayedIp = ip;
            await user.save();
        }

        // Count users with this IP
        const userCount = await User.countDocuments({ 'riskProfile.lastPlayedIp': ip });
        if (userCount > 3) return 'MULTI_ACCOUNT_IP';
        return null;
    }

    /**
     * Analyze Game Result for Anomalies (Win Rate / Wallet Spike)
     */
    async analyzeResult(userId, winAmount, betAmount) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            const flags = [];
            let score = user.riskProfile?.riskScore || 0;

            // 1. Impossible Win Rate Check
            if (user.totalBets > 50 && user.winPercentage > 90) {
                flags.push('IMPOSSIBLE_WIN_RATE');
                score += 30; // High risk
            }

            // 2. Wallet Spike
            // If single win is > 100x bet and amount > 10000
            if (winAmount > betAmount * 100 && winAmount > 10000) {
                flags.push('HUGE_WIN_SPIKE');
                score += 10; // Worth checking
            }

            if (flags.length > 0) {
                await this.updateRiskProfile(user, flags, score);
            }
        } catch (error) {
            console.error('Result Analysis Error:', error);
        }
    }

    async updateRiskProfile(user, newFlags, newScore) {
        const uniqueFlags = [...new Set([...(user.riskProfile?.flags || []), ...newFlags])];

        await User.findByIdAndUpdate(user._id, {
            $set: {
                'riskProfile.riskScore': Math.min(newScore, 100),
                'riskProfile.flags': uniqueFlags,
                'riskProfile.suspiciousActivityCount': (user.riskProfile?.suspiciousActivityCount || 0) + 1
            }
        });
    }

    async addFlag(user, flag) {
        await this.updateRiskProfile(user, [flag], (user.riskProfile?.riskScore || 0) + 10);
    }

    async getHighRiskUsers() {
        return await User.find({ 'riskProfile.riskScore': { $gt: 50 } })
            .select('name email riskProfile balance isBanned')
            .sort({ 'riskProfile.riskScore': -1 });
    }
}

module.exports = new FraudService();
