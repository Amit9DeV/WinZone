/**
 * Keno Game Engine
 * User picks 1-10 numbers from 1-80.
 * Server draws 20 numbers.
 * Payout depends on number of hits (matches).
 */

const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');
const walletService = require('../../services/wallet.service');

let io = null;
let gameConfig = null;

// Standard Keno Payouts (Classic Risk)
// Index = Number of Hits. Array index = payout multiplier.
const PAYOUTS = {
    1: [0, 3.8], // Pick 1: 0 hits=0x, 1 hit=3.8x
    2: [0, 1.7, 5.2], // Pick 2
    3: [0, 0, 2.7, 48], // Pick 3: 2 hits=2.7x, 3 hits=48x
    4: [0, 0, 1.7, 10, 84],
    5: [0, 0, 1.4, 4.1, 15, 290],
    6: [0, 0, 0, 3, 9, 180, 710],
    7: [0, 0, 0, 1.6, 4.7, 26, 400, 800],
    8: [0, 0, 0, 0, 2, 8, 55, 300, 800],
    9: [0, 0, 0, 0, 0, 4, 15, 75, 500, 1000],
    10: [0, 0, 0, 0, 0, 1.5, 4.5, 25, 150, 800, 1000]
};

/**
 * Initialize Keno game engine
 */
async function initialize(socketIO, config) {
    io = socketIO;
    gameConfig = config;
    console.log('🎱 Initializing Keno game engine...');

    const nsp = io.of('/keno');

    nsp.on('connection', (socket) => {
        socket.emit('init', {
            minBet: gameConfig.minBet || 1,
            maxBet: gameConfig.maxBet || 5000,
            payouts: PAYOUTS
        });

        socket.on('bet:place', (data) => handleBet(socket, data));
    });

    console.log('✅ Keno game engine active');
}

/**
 * Handle a Keno bet
 */
async function handleBet(socket, data) {
    try {
        const { amount, numbers } = data;
        let userId = data.userId || socket.userId || socket.handshake.query.userId;

        // Sanitize userId
        if (userId === 'undefined' || userId === 'null') userId = null;

        if (!userId) return socket.emit('error', { message: 'Unauthorized' });

        // 1. Validation
        const Game = require('../../models/Game.model');
        const gameConfigDoc = await Game.findOne({ gameId: 'keno' });
        const minBet = gameConfigDoc?.minBet || 1;
        const maxBet = gameConfigDoc?.maxBet || 5000;
        const isEnabled = gameConfigDoc?.enabled ?? true;

        if (!isEnabled) throw new Error('Game is currently disabled');
        if (!amount || amount < minBet) throw new Error(`Min bet is ${minBet}`);
        if (amount > maxBet) throw new Error(`Max bet is ${maxBet}`);
        if (!Array.isArray(numbers) || numbers.length < 1 || numbers.length > 10) {
            throw new Error('Pick between 1 and 10 numbers');
        }

        // Validate numbers range (1-80) and uniqueness
        const uniqueNumbers = [...new Set(numbers)];
        if (uniqueNumbers.length !== numbers.length) throw new Error('Duplicate numbers selected');
        if (numbers.some(n => n < 1 || n > 80)) throw new Error('Numbers must be between 1 and 80');

        // 2. Check Balance & Deduct
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (user.balance < amount) throw new Error('Insufficient balance');

        await walletService.updateBalance(userId, -amount, 'Keno Bet');

        // 3. Generate Draw (20 random numbers from 1-80)
        const draw = [];
        const pool = Array.from({ length: 80 }, (_, i) => i + 1);

        // Fisher-Yates shuffle or simplified splice approach
        for (let i = 0; i < 20; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            draw.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
        }
        draw.sort((a, b) => a - b); // Sorting helps client visualization

        // 4. Calculate Hits
        const hits = numbers.filter(n => draw.includes(n));
        const hitCount = hits.length;
        const pickCount = numbers.length;

        // 5. Calculate Payout
        let multiplier = 0;
        if (PAYOUTS[pickCount] && PAYOUTS[pickCount][hitCount] !== undefined) {
            multiplier = PAYOUTS[pickCount][hitCount];
        }

        const won = multiplier > 0;
        const payout = amount * multiplier;

        // 6. Update User Balance if won
        if (won) {
            await walletService.updateBalance(userId, payout, 'Keno Win');
        }

        // Update stats
        user.totalBets += 1;
        user.totalWagered += amount;
        if (won) {
            user.totalWins += 1;
            user.biggestWin = Math.max(user.biggestWin, payout);
        } else {
            user.totalLosses += 1;
        }
        await user.save();

        // 7. Record Bet
        await Bet.create({
            userId: user._id,
            gameId: 'keno',
            amount,
            result: won ? 'WON' : 'LOST',
            payout,
            multiplier,
            metadata: {
                selected: numbers,
                drawn: draw,
                hits: hits
            }
        });

        // 8. Emit Result
        socket.emit('game:result', {
            betId: uuidv4(),
            draw,
            hits,
            won,
            payout,
            multiplier,
            newBalance: await walletService.getBalance(userId)
        });

        // 9. Broadcast Live Bet (Global)
        io.emit('bet:live', {
            id: uuidv4(),
            username: user.name,
            game: 'Keno',
            amount: amount,
            multiplier: multiplier,
            payout: payout,
            won: won
        });

    } catch (error) {
        console.error('Keno Error:', error);
        socket.emit('error', { message: error.message || 'Bet failed' });
    }
}

function stop() { }

module.exports = { initialize, stop };
