const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboard.service');

// Get leaderboard for a specific period
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;

        // Return cached leaderboard
        const data = await leaderboardService.getLeaderboard(period);

        // If empty, trigger an update (async) and return potentially empty or wait?
        // Let's wait if it's empty, otherwise return stale.
        if (!data || data.length === 0) {
            await leaderboardService.updateLeaderboard(period);
            const freshData = await leaderboardService.getLeaderboard(period);
            return res.json(freshData);
        }

        res.json(data);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
