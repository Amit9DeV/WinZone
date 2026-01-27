const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const DailyReward = require('../models/DailyReward.model');
const walletService = require('../services/wallet.service');

/**
 * GET /api/rewards/status
 * Check daily reward status for current user
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        let reward = await DailyReward.findOne({ userId: req.user._id });

        if (!reward) {
            reward = new DailyReward({ userId: req.user._id });
            await reward.save();
        }

        // Check if streak is still valid
        reward.checkStreak();
        await reward.save();

        const canClaim = reward.canClaim();
        const rewardAmount = canClaim ? reward.getRewardAmount() : 0;

        res.json({
            success: true,
            data: {
                canClaim,
                currentStreak: reward.currentStreak,
                rewardAmount,
                nextRewardDay: (reward.currentStreak % 7) + 1,
                totalClaimed: reward.totalClaimed,
                lastClaimDate: reward.lastClaimDate
            }
        });
    } catch (error) {
        console.error('Daily reward status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reward status'
        });
    }
});

/**
 * POST /api/rewards/claim
 * Claim daily reward
 */
router.post('/claim', authenticate, async (req, res) => {
    try {
        let reward = await DailyReward.findOne({ userId: req.user._id });

        if (!reward) {
            reward = new DailyReward({ userId: req.user._id });
        }

        // Validate
        reward.checkStreak();

        if (!reward.canClaim()) {
            return res.status(400).json({
                success: false,
                message: 'Already claimed today. Come back tomorrow!'
            });
        }

        const amount = reward.getRewardAmount();

        // Update reward
        reward.currentStreak += 1;
        reward.lastClaimDate = new Date();
        reward.totalClaimed += amount;
        reward.claimHistory.push({
            day: reward.currentStreak,
            amount,
            claimedAt: new Date()
        });
        await reward.save();

        // Credit user balance
        await walletService.updateBalance(req.user._id, amount, 'Daily Reward');
        const newBalance = await walletService.getBalance(req.user._id);

        res.json({
            success: true,
            data: {
                amount,
                newBalance,
                currentStreak: reward.currentStreak,
                nextRewardDay: (reward.currentStreak % 7) + 1
            },
            message: `Reward claimed! +₹${amount}`
        });
    } catch (error) {
        console.error('Daily reward claim error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to claim reward'
        });
    }
});

module.exports = router;
