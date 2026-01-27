/**
 * Limbo Game Engine
 * Player sets a target multiplier.
 * If the result is higher than the target, they win!
 */

const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');
const walletService = require('../../services/wallet.service');

let io = null;
let gameConfig = null;

// Game constants
const MAX_MULTIPLIER = 1000000; // 1M x max result
const HOUSE_EDGE_PERCENT = 1; // 1% house edge

/**
 * Initialize Limbo game engine
 */
async function initialize(socketIO, config) {
    io = socketIO;
    gameConfig = config;
    console.log('🚀 Initializing Limbo game engine...');

    const nsp = io.of('/limbo');

    nsp.on('connection', (socket) => {
        // Send initial config
        socket.emit('init', {
            minBet: gameConfig.minBet || 1,
            maxBet: gameConfig.maxBet || 10000,
            maxMultiplier: MAX_MULTIPLIER
        });

        socket.on('bet:place', (data) => handleBet(socket, data));
    });

    console.log('✅ Limbo game engine active');
}

/**
 * Handle a Limbo bet
 */
async function handleBet(socket, data) {
    try {
        const { amount, targetMultiplier } = data;
        let userId = data.userId; // In a real app, get from auth token/session

        if (!userId && socket.userId) {
            userId = socket.userId;
        }

        if (!userId) {
            // Fallback: try handshake query if not set on socket object yet
            userId = socket.handshake.query.userId;
        }

        // Sanitize userId
        if (userId === 'undefined' || userId === 'null') userId = null;

        if (!userId) return socket.emit('error', { message: 'Unauthorized' });

        // 1. Validation
        const Game = require('../../models/Game.model');
        const gameConfigDoc = await Game.findOne({ gameId: 'limbo' });
        const minBet = gameConfigDoc?.minBet || 1;
        const maxBet = gameConfigDoc?.maxBet || 10000;
        const isEnabled = gameConfigDoc?.enabled ?? true;

        if (!isEnabled) throw new Error('Game is currently disabled');
        if (!amount || amount < minBet) throw new Error(`Min bet is ${minBet}`);
        if (amount > maxBet) throw new Error(`Max bet is ${maxBet}`);
        if (!targetMultiplier || targetMultiplier < 1.01 || targetMultiplier > MAX_MULTIPLIER) {
            throw new Error('Invalid target multiplier (1.01x - 1,000,000x)');
        }

        // 2. Check Balance & Deduct
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (user.balance < amount) throw new Error('Insufficient balance');

        // Use wallet service to update balance (handles socket emission too)
        await walletService.updateBalance(userId, -amount, 'Limbo Bet');

        // 3. Generate Result (Provably Fair placeholder logic)
        // For Limbo: We generate a float number.
        // Win Chance % = 99 / Target
        // We can simulate this by generating result from 1.00 to MAX.
        // A common formula: result = 99 / (random * 100)
        // If random is close to 0, result is high.

        const random = Math.random();
        // Avoid division by zero, though unlikely with Math.random() < 1
        // Range of random: [0, 1)
        // We want result range [1, MAX]
        // Example: If random is 0.5 (50%), result = 99 / 50 = 1.98x
        // If user targeted 2.0x, they lose. Correct.

        // Let's cap the result at MAX_MULTIPLIER
        let result = 1.0;
        if (random === 0) {
            result = MAX_MULTIPLIER;
        } else {
            result = 99 / (random * 100);
        }

        if (result < 1) result = 1;
        if (result > MAX_MULTIPLIER) result = MAX_MULTIPLIER;

        // Truncate to 2 decimal places for display
        const displayResult = Math.floor(result * 100) / 100;

        // 4. Check Win
        const won = displayResult >= targetMultiplier;

        let payout = 0;
        let profit = 0;

        if (won) {
            payout = amount * targetMultiplier;
            profit = payout - amount;

            await walletService.updateBalance(userId, payout, 'Limbo Win');
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

        // 5. Record Bet
        await Bet.create({
            userId: user._id,
            gameId: 'limbo',
            amount,
            result: won ? 'WON' : 'LOST',
            payout,
            multiplier: displayResult, // The actual result achieved
            metadata: { target: targetMultiplier, result: displayResult }
        });

        // 6. Emit Result
        // Short delay for suspense or just instant? Instant is better for Limbo usually.
        // But client might want animation time.
        socket.emit('game:result', {
            betId: uuidv4(),
            result: displayResult,
            won,
            payout,
            target: targetMultiplier,
            newBalance: await walletService.getBalance(userId)
        });

    } catch (error) {
        console.error('Limbo Error:', error);
        socket.emit('error', { message: error.message || 'Bet failed' });
    }
}

function stop() {
    // cleanup
}

module.exports = {
    initialize,
    stop
};
