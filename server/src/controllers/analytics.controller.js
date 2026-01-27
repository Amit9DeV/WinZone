/**
 * Analytics Controller
 * Advanced aggregation pipelines for Admin Dashboard
 */

const mongoose = require('mongoose');
const Bet = require('../models/Bet.model');
const User = require('../models/User.model');
const Game = require('../models/Game.model');

/**
 * Get overall dashboard stats
 * Total GGR, Volume, Active Users
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [totalStats, todayStats, activeUsers] = await Promise.all([
            // 1. All Time Stats
            Bet.aggregate([
                {
                    $group: {
                        _id: null,
                        totalWagered: { $sum: '$amount' },
                        totalPayout: { $sum: '$payout' },
                        betCount: { $sum: 1 }
                    }
                }
            ]),

            // 2. Today's Stats
            Bet.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                {
                    $group: {
                        _id: null,
                        totalWagered: { $sum: '$amount' },
                        totalPayout: { $sum: '$payout' },
                        betCount: { $sum: 1 }
                    }
                }
            ]),

            // 3. Active Users (Last 24h)
            Bet.distinct('userId', { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        ]);

        const allTime = totalStats[0] || { totalWagered: 0, totalPayout: 0, betCount: 0 };
        const today = todayStats[0] || { totalWagered: 0, totalPayout: 0, betCount: 0 };

        res.json({
            success: true,
            data: {
                allTime: {
                    ...allTime,
                    ggr: allTime.totalWagered - allTime.totalPayout,
                    rtp: allTime.totalWagered > 0 ? (allTime.totalPayout / allTime.totalWagered) * 100 : 0
                },
                today: {
                    ...today,
                    ggr: today.totalWagered - today.totalPayout
                },
                activeUsers24h: activeUsers.length
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Game Performance Stats
 * Breakdown by Game ID
 */
exports.getGamePerformance = async (req, res) => {
    try {
        const stats = await Bet.aggregate([
            {
                $group: {
                    _id: '$gameId',
                    totalWagered: { $sum: '$amount' },
                    totalPayout: { $sum: '$payout' },
                    betCount: { $sum: 1 },
                    winCount: {
                        $sum: { $cond: [{ $eq: ['$result', 'WON'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    gameId: '$_id',
                    totalWagered: 1,
                    totalPayout: 1,
                    betCount: 1,
                    winCount: 1,
                    ggr: { $subtract: ['$totalWagered', '$totalPayout'] },
                    rtp: {
                        $cond: [
                            { $gt: ['$totalWagered', 0] },
                            { $multiply: [{ $divide: ['$totalPayout', '$totalWagered'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalWagered: -1 } }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Profit/Loss Chart Data
 * Last 7 days
 */
exports.getPnlChart = async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const chartData = await Bet.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    wagered: { $sum: '$amount' },
                    payout: { $sum: '$payout' },
                    profit: { $sum: { $subtract: ['$amount', '$payout'] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: chartData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
