const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet.model');
const { authenticate } = require('../middleware/auth.middleware');

// Get user statistics with chart data
router.get('/stats/chart', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { period = '7d' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Aggregate daily stats
        const dailyStats = await Bet.aggregate([
            {
                $match: {
                    userId: userId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    bets: { $sum: 1 },
                    wagered: { $sum: '$amount' },
                    won: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'win'] }, '$payout', 0]
                        }
                    },
                    wins: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'win'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    date: '$_id',
                    bets: 1,
                    profit: { $subtract: ['$won', '$wagered'] },
                    wins: 1,
                    _id: 0
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Get overall stats
        const overallStats = await Bet.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $group: {
                    _id: null,
                    totalBets: { $sum: 1 },
                    totalWagered: { $sum: '$amount' },
                    totalWon: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'win'] }, '$payout', 0]
                        }
                    },
                    wins: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'win'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const summary = overallStats[0] || { totalBets: 0, wins: 0, totalWagered: 0, totalWon: 0 };
        const totalProfit = summary.totalWon - summary.totalWagered;
        const winRate = summary.totalBets > 0 ? (summary.wins / summary.totalBets) * 100 : 0;

        res.json({
            daily: dailyStats,
            summary: {
                totalProfit: totalProfit,
                totalBets: summary.totalBets,
                wins: summary.wins,
                losses: summary.totalBets - summary.wins,
                winRate: winRate.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Stats chart error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
