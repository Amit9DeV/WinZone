const mongoose = require('mongoose');

const dailyRewardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    lastClaimDate: {
        type: Date,
        default: null
    },
    totalClaimed: {
        type: Number,
        default: 0
    },
    claimHistory: [{
        day: Number,
        amount: Number,
        claimedAt: Date
    }]
}, {
    timestamps: true
});

// Reward schedule (7-day cycle)
const REWARD_SCHEDULE = [
    10,   // Day 1: ₹10
    15,   // Day 2: ₹15
    20,   // Day 3: ₹20
    30,   // Day 4: ₹30
    50,   // Day 5: ₹50
    75,   // Day 6: ₹75
    100   // Day 7: ₹100
];

dailyRewardSchema.methods.canClaim = function () {
    if (!this.lastClaimDate) return true;

    const now = new Date();
    const lastClaim = new Date(this.lastClaimDate);

    // Check if it's a new day (UTC)
    const isNewDay = now.getUTCDate() !== lastClaim.getUTCDate() ||
        now.getUTCMonth() !== lastClaim.getUTCMonth() ||
        now.getUTCFullYear() !== lastClaim.getUTCFullYear();

    return isNewDay;
};

dailyRewardSchema.methods.getRewardAmount = function () {
    const day = (this.currentStreak % 7);
    return REWARD_SCHEDULE[day];
};

dailyRewardSchema.methods.checkStreak = function () {
    if (!this.lastClaimDate) return true;

    const now = new Date();
    const lastClaim = new Date(this.lastClaimDate);
    const diffTime = Math.abs(now - lastClaim);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If more than 1 day passed, streak is broken
    if (diffDays > 1) {
        this.currentStreak = 0;
        return false;
    }

    return true;
};

module.exports = mongoose.model('DailyReward', dailyRewardSchema);
