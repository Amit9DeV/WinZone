const Bet = require('../models/Bet.model');
const Leaderboard = require('../models/Leaderboard.model');

const leaderboardService = {
    /**
     * Update leaderboard for a specific period
     */
    async updateLeaderboard(period) {
        try {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'daily':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'weekly':
                    const dayOfWeek = now.getDay();
                    startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    return;
            }

            const entries = await Bet.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                {
                    $unwind: '$userInfo'
                },
                {
                    $group: {
                        _id: '$userId',
                        username: { $first: '$userInfo.name' },
                        totalBets: { $sum: 1 },
                        totalWagered: { $sum: '$amount' },
                        totalWon: {
                            $sum: {
                                $cond: [{ $eq: ['$result', 'WON'] }, '$payout', 0]
                            }
                        },
                        wins: {
                            $sum: {
                                $cond: [{ $eq: ['$result', 'WON'] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        userId: '$_id',
                        username: 1,
                        totalBets: 1,
                        totalWagered: 1,
                        totalWon: 1,
                        totalProfit: { $subtract: ['$totalWon', '$totalWagered'] },
                        winRate: {
                            $multiply: [
                                { $divide: ['$wins', '$totalBets'] },
                                100
                            ]
                        }
                    }
                },
                {
                    $match: {
                        totalProfit: { $gt: 0 }
                    }
                },
                {
                    $sort: { totalProfit: -1 }
                },
                {
                    $limit: 20
                }
            ]);

            // Save to DB
            // We upsert the "current" leaderboard for today/this week/this month
            // Or strictly create new snapshots.
            // For a live dashboard, usually we want the "Latest" one.

            // Strategy: Upsert based on the period and "start of period" date?
            // Or simpler: Just keep ONE document for 'current' daily, and maybe archive others?
            // Let's just create a new one for "now" and we can query the latest.

            // actually, simpler: Find ONE document for this period and update it.
            // If historical is needed, we'd add 'date' query.

            // Let's just update "Latest"
            await Leaderboard.findOneAndUpdate(
                { period },
                {
                    period,
                    entries,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );

            console.log(`✅ Leaderboard updated for ${period}`);

        } catch (error) {
            console.error(`Failed to update ${period} leaderboard:`, error);
        }
    },

    /**
     * Get Cached Leaderboard
     */
    async getLeaderboard(period) {
        const lb = await Leaderboard.findOne({ period }).sort({ updatedAt: -1 });
        return lb ? lb.entries : [];
    }
};

module.exports = leaderboardService;
