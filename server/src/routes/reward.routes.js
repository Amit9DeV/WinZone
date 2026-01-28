const express = require('express');
const router = express.Router();
const DailyReward = require('../models/DailyReward.model');
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

// Check Reward Status
router.get('/status', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        let reward = await DailyReward.findOne({ userId });

        if (!reward) {
            reward = new DailyReward({ userId });
            await reward.save();
        }

        // Check streak status (reset if missed)
        const isStreakValid = reward.checkStreak();
        if (!isStreakValid) {
            await reward.save(); // Save reset state
        }

        const canClaim = reward.canClaim();
        const rewardAmount = reward.getRewardAmount();

        // Calculate next reward day (1-7)
        const nextRewardDay = (reward.currentStreak % 7) + 1;

        res.json({
            success: true,
            data: {
                canClaim,
                currentStreak: reward.currentStreak,
                rewardAmount,
                nextRewardDay,
                lastClaimDate: reward.lastClaimDate
            }
        });
    } catch (error) {
        console.error('Reward Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Claim Reward
router.post('/claim', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const reward = await DailyReward.findOne({ userId });
        if (!reward) {
            return res.status(404).json({ message: 'Reward profile not found.' });
        }

        if (!reward.canClaim()) {
            return res.status(400).json({ message: 'Reward already claimed for today.' });
        }

        const amount = reward.getRewardAmount();

        // Update Reward Doc
        reward.lastClaimDate = new Date();
        reward.currentStreak += 1;
        reward.totalClaimed += amount;
        reward.claimHistory.push({
            day: reward.currentStreak,
            amount,
            claimedAt: new Date()
        });
        await reward.save();

        // Update User Balance
        const user = await User.findById(userId);
        user.balance += amount;
        await user.save();

        res.json({
            success: true,
            message: `Claimed ₹${amount}`,
            newBalance: user.balance,
            currentStreak: reward.currentStreak
        });

    } catch (error) {
        console.error('Claim Reward Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
