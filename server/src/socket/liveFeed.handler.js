/**
 * Live Bets Broadcaster
 * Broadcasts "big" bets/wins to all connected clients for the live feed
 */

const BIG_BET_THRESHOLD = 1000; // ₹1000
const BIG_WIN_MULTIPLIER = 10; // 10x or more

function broadcastBet(io, betData) {
    const { userId, username, gameId, amount, multiplier, payout, won } = betData;

    // Only broadcast "interesting" bets
    const isBigBet = amount >= BIG_BET_THRESHOLD;
    const isBigWin = won && multiplier >= BIG_WIN_MULTIPLIER;

    if (isBigBet || isBigWin) {
        io.emit('public:bet', {
            id: `${userId}-${Date.now()}`,
            username: username || 'Anonymous',
            gameId,
            amount,
            multiplier: multiplier || 0,
            payout: payout || 0,
            won,
            timestamp: Date.now()
        });
    }
}

module.exports = { broadcastBet };
