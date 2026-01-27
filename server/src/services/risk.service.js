/**
 * Risk Management Service
 * Detects suspicious activity and high-value players
 */
const User = require('../models/User.model');
const Bet = require('../models/Bet.model');

/**
 * Get "Whales" - Users with high balance or high total wagered
 */
exports.getWhales = async () => {
    // Users with Balance > 10,000 or Total Wagered > 100,000
    const whales = await User.find({
        $or: [
            { balance: { $gt: 10000 } },
            { totalWagered: { $gt: 100000 } }
        ]
    })
        .select('name email balance totalWagered totalWins totalLosses createdAt')
        .sort({ balance: -1 })
        .limit(50);

    return whales.map(user => ({
        ...user.toObject(),
        winRate: (user.totalWins / (user.totalWins + user.totalLosses || 1) * 100).toFixed(1)
    }));
};

/**
 * Get Risk Alerts
 * Users with unusually high win rates or massive single wins
 */
exports.getRiskAlerts = async () => {
    const alerts = [];

    // 1. High Win Rate Check (> 70% win rate with > 20 bets)
    const luckyUsers = await User.find({
        totalBets: { $gt: 20 }
    }).lean();

    luckyUsers.forEach(user => {
        const winRate = (user.totalWins / user.totalBets) * 100;
        if (winRate > 70) {
            alerts.push({
                type: 'HIGH_WIN_RATE',
                severity: 'medium',
                userId: user._id,
                name: user.name,
                message: `Win Rate: ${winRate.toFixed(1)}% (${user.totalWins}/${user.totalBets})`,
                timestamp: new Date()
            });
        }
    });

    // 2. Massive Wins (Single payouts > 5000)
    // In a real app, this would be a separate "Alerts" collection
    // For MVP, we query recent big bets
    const bigWins = await Bet.find({
        payout: { $gt: 5000 },
        result: 'WON',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
    }).populate('userId', 'name').limit(20);

    bigWins.forEach(bet => {
        alerts.push({
            type: 'MASSIVE_WIN',
            severity: 'high',
            userId: bet.userId?._id,
            name: bet.userId?.name || 'Unknown',
            message: `Won ₹${bet.payout} in ${bet.gameId} (${bet.multiplier}x)`,
            timestamp: bet.createdAt
        });
    });

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
};
