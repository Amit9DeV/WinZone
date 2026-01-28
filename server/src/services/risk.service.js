const User = require('../models/User.model');
const Bet = require('../models/Bet.model');

/**
 * Risk Analysis Service
 * Detects anomalous behavior and potential fraud
 */
class RiskService {

    /**
     * Analyze a user's recent betting history
     * @param {string} userId 
     */
    async analyzeUser(userId) {
        try {
            // Fetch last 50 bets
            const bets = await Bet.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50);

            if (bets.length < 10) return; // Not enough data

            let riskScore = 0;
            let flags = [];

            // 1. High Win Rate Check (>90%)
            const wins = bets.filter(b => b.result === 'WON').length;
            const winRate = (wins / bets.length) * 100;

            if (winRate > 90) {
                riskScore += 40;
                flags.push(`Abnormal Win Rate: ${winRate.toFixed(1)}%`);
            }

            // 2. ROI Check (Profit vs Wagered)
            const totalWagered = bets.reduce((sum, b) => sum + b.amount, 0);
            const totalPayout = bets.reduce((sum, b) => sum + (b.payout || 0), 0);
            const profit = totalPayout - totalWagered;
            const roi = totalWagered > 0 ? (profit / totalWagered) * 100 : 0;

            if (roi > 300) { // >300% profit is very suspicious for casino games
                riskScore += 50;
                flags.push(`Impossible ROI: ${roi.toFixed(0)}%`);
            }

            // 3. Sniper Check (High Multiplier Consistency)
            // If user consistently cashes out > 10x
            const highMultipliers = bets.filter(b => b.multiplier && b.multiplier > 10).length;
            if (highMultipliers > 5 && winRate > 50) {
                riskScore += 30;
                flags.push('Sniper behavior detected');
            }

            // Update User Risk Status
            let newStatus = 'SAFE';
            if (riskScore >= 80) newStatus = 'SUSPICIOUS';
            if (riskScore >= 100) newStatus = 'SUSPICIOUS'; // Could auto-ban, but safer to just flag

            if (riskScore > 0) {
                console.log(`⚠️ Risk Alert [${userId}]: Score ${riskScore} - ${flags.join(', ')}`);
                await User.findByIdAndUpdate(userId, {
                    riskScore: Math.min(riskScore, 100),
                    riskStatus: newStatus
                });
            }

            return { riskScore, flags, status: newStatus };

        } catch (error) {
            console.error('Risk analysis failed:', error);
        }
    }

    // Admin Dashboard Helpers
    async getRiskAlerts() {
        return await User.find({ riskStatus: 'SUSPICIOUS' })
            .select('name email riskScore riskStatus balance')
            .sort({ riskScore: -1 });
    }

    async getWhales() {
        return await User.find({ balance: { $gt: 100000 } })
            .select('name email balance totalWagered')
            .sort({ balance: -1 });
    }
}

module.exports = new RiskService();
