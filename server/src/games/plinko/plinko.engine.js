/**
 * Plinko Game Engine
 * Backend simulation of ball path and multiplier calculation
 */
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

// Multipliers configuration
// Rows: 8-16, Risk: Low/Med/High
// Simplified for 8-16 rows Med risk
const MULTIPLIERS = {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
    // ... complete table should be here
};
// Fallback generator if config missing
const getMultiplier = (rows, index) => {
    // Distance from center
    const center = rows / 2;
    const dist = Math.abs(index - center);
    // Higher distance = Higher multiplier (Exponential)
    // Simple mock formula
    let m = Math.pow(dist, 2.5) / 10;
    if (m < 0.3) m = 0.3;
    return parseFloat(m.toFixed(1));
};

function initialize(io, config) {
    const nsp = io.of('/plinko');

    nsp.on('connection', (socket) => {

        socket.on('bet:place', async (data) => {
            try {
                let { userId, betAmount, rows, risk } = data; // rows 8-16

                // Sanitize userId
                if (userId === 'undefined' || userId === 'null') userId = null;

                if (!userId) throw new Error('Unauthorized');

                // Fetch Dynamic Config
                const Game = require('../../models/Game.model');
                const gameConfigDoc = await Game.findOne({ gameId: 'plinko' });
                const minBet = gameConfigDoc?.minBet || 10;
                const maxBet = gameConfigDoc?.maxBet || 1000;
                const isEnabled = gameConfigDoc?.enabled ?? true;

                if (!isEnabled) throw new Error('Game is currently disabled');
                if (betAmount < minBet) throw new Error(`Min bet is ${minBet}`);
                if (betAmount > maxBet) throw new Error(`Max bet is ${maxBet}`);

                // 1. Transaction
                const user = await User.findById(userId);
                if (!user || user.balance < betAmount) throw new Error('Insufficient balance');

                user.balance -= betAmount;
                user.totalBets += 1;
                user.totalWagered += betAmount;
                await user.save();

                // 2. Simulate Path
                // Binomial distribution approx
                // 0 = left, 1 = right
                const path = [];
                let rightMoves = 0;
                for (let i = 0; i < rows; i++) {
                    const dir = Math.random() > 0.5 ? 1 : 0; // 50/50 for Med Risk
                    path.push(dir); // 'L' or 'R' effectively
                    rightMoves += dir;
                }

                // Output slot is simply sum(rightMoves) (0 to rows)
                const slotIndex = rightMoves;

                // 3. Calculate Result
                // Use config or fallback
                let multiplier = 0;
                if (MULTIPLIERS[rows] && MULTIPLIERS[rows][slotIndex]) {
                    multiplier = MULTIPLIERS[rows][slotIndex];
                } else {
                    multiplier = getMultiplier(rows, slotIndex);
                }
                // Clamp min/max for safety if using generated
                if (multiplier > 1000) multiplier = 1000;

                const payout = Math.floor(betAmount * multiplier);

                // 4. Record Bet (Persistent)
                await Bet.create({
                    userId: user._id,
                    gameId: 'plinko',
                    amount: betAmount,
                    result: payout > betAmount ? 'WON' : (payout > 0 ? 'WON' : 'LOST'), // "WON" even if lost money? Technically yes if > 0. But for transparency let's say WON only if > bet. Actually standard is Won > 0.
                    payout: payout,
                    multiplier: multiplier,
                    metadata: { rows, risk, path, slotIndex }
                });

                // 5. Settle
                if (payout > 0) {
                    user.balance += payout;
                    if (payout > betAmount) user.totalWins += 1; // Win only if profit
                    else user.totalLosses += 1; // Loss if returned less? Debateable. Simplified.

                    user.biggestWin = Math.max(user.biggestWin, payout);
                    await user.save();
                } else {
                    user.totalLosses += 1;
                    await user.save();
                }

                // 6. Emit
                socket.emit('game:result', {
                    path, // Array of 0/1 to animate visual
                    slotIndex,
                    multiplier,
                    payout,
                    balance: user.balance
                });

            } catch (e) {
                socket.emit('error', { message: e.message });
            }
        });
    });
}

module.exports = { initialize };
