const Bet = require('../models/Bet.model');
const Leaderboard = require('../models/Leaderboard.model');

const leaderboardService = {
    /**
     * Update leaderboard for a specific period
     */
    async updateLeaderboard(period) {
        try {
            if (period === 'biggest-win') {
                return this.updateBiggestWinLeaderboard();
            }

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
     * Update Biggest Win Leaderboard (All Time)
     */
    async updateBiggestWinLeaderboard() {
        try {
            const entries = await Bet.aggregate([
                {
                    $match: {
                        result: 'WON',
                        payout: { $gt: 0 }
                    }
                },
                {
                    $sort: { payout: -1 } // Sort by Payout Amount
                },
                {
                    $limit: 20
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
                    $project: {
                        userId: '$userId',
                        username: '$userInfo.name',
                        gameId: '$gameId',
                        multiplier: '$multiplier',
                        betAmount: '$amount',
                        payout: '$payout',
                        totalProfit: '$payout', // Align with schema
                        // Add dummy values for required schema fields if needed, or make them optional
                    }
                }
            ]);

            await Leaderboard.findOneAndUpdate(
                { period: 'biggest-win' },
                {
                    period: 'biggest-win',
                    entries,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log(`✅ Biggest Win Leaderboard updated`);
        } catch (error) {
            console.error("Failed to update biggest-win leaderboard", error);
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
