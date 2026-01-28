const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    totalBets: Number,
    totalWagered: Number,
    totalWon: Number,
    totalProfit: Number,
    winRate: Number,
    // For Biggest Win Leaderboard
    gameId: String,
    multiplier: Number,
    betAmount: Number,
    payout: Number
});

const leaderboardSchema = new mongoose.Schema({
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'all-time', 'biggest-win'],
        required: true
    },
    date: {
        type: Date, // For historical records (e.g., date of the snapshot)
        default: Date.now
    },
    entries: [leaderboardEntrySchema],
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to quickly find the latest leaderboard for a period
leaderboardSchema.index({ period: 1, date: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
