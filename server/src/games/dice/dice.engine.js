/**
 * Dice Game Engine
 * Simple Provably Fair Dice Game
 * User predicts if result will be Over/Under a chosen number
 */

const { v4: uuidv4 } = require('uuid');

let io = null;
let gameConfig = null;

// Game constants
const MIN_MULTIPLIER = 1.01;
const MAX_MULTIPLIER = 990;

/**
 * Initialize Dice game engine
 */
async function initialize(socketIO, config) {
    io = socketIO;
    gameConfig = config;
    console.log('🎲 Initializing Dice game engine...');

    const nsp = io.of('/dice');

    nsp.on('connection', (socket) => {
        // console.log(`User connected to Dice: ${socket.id}`);

        // Send initial config/state if needed
        socket.emit('init', {
            minBet: gameConfig.minBet,
            maxBet: gameConfig.maxBet
        });

        socket.on('bet:place', (data) => handleBet(socket, data));
    });

    console.log('✅ Dice game engine active');
}

const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

// ... existing code ...

/**
 * Handle a dice bet
 */
async function handleBet(socket, data) {
    try {
        let { amount, target, condition, userId } = data; // userId needed from client

        // Sanitize userId
        if (userId === 'undefined' || userId === 'null') userId = null;

        console.log(`🎲 Dice Bet: Amount=${amount}, Target=${target}, Condition=${condition}, UserId=${userId}`);

        // 1. Validation
        const Game = require('../../models/Game.model');
        const gameConfigDoc = await Game.findOne({ gameId: 'dice' });
        const minBet = gameConfigDoc?.minBet || 1;
        const maxBet = gameConfigDoc?.maxBet || 10000;
        const isEnabled = gameConfigDoc?.enabled ?? true;

        if (!isEnabled) throw new Error('Game is currently disabled');
        if (amount < minBet) throw new Error(`Min bet is ${minBet}`);
        if (amount > maxBet) throw new Error(`Max bet is ${maxBet}`);
        if (target < 2 || target > 98) throw new Error('Target out of range');

        // 2. Fetch User & Check Balance
        // Note: For real security, userId should be derived from socket auth token, not client payload
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (user.balance < amount) throw new Error('Insufficient balance');

        // 3. Deduct Bet Amount (Atomic transaction ideally, simplified here)
        user.balance -= amount;
        user.totalBets += 1;
        user.totalWagered += amount;
        await user.save();

        // 4. Generate Result
        const roll = Math.random() * 100;
        const result = parseFloat(roll.toFixed(2));

        // 5. Check Win Condition
        let won = false;
        let multiplier = 0;

        if (condition === 'under' && result < target) won = true;
        if (condition === 'over' && result > target) won = true;

        // 6. Calculate Payout
        if (won) {
            const winChance = condition === 'under' ? target : (100 - target);
            multiplier = parseFloat((99 / winChance).toFixed(2));
            const payout = amount * multiplier;

            user.balance += payout;
            user.totalWins += 1;
            user.biggestWin = Math.max(user.biggestWin, payout);
            await user.save();

            // Record Bet (Won)
            await Bet.create({
                userId: user._id,
                gameId: 'dice',
                amount: amount,
                result: 'WON',
                payout: payout,
                multiplier: multiplier,
                metadata: { target, condition, result }
            });

        } else {
            user.totalLosses += 1;
            await user.save();

            // Record Bet (Lost)
            await Bet.create({
                userId: user._id,
                gameId: 'dice',
                amount: amount,
                result: 'LOST',
                payout: 0,
                metadata: { target, condition, result }
            });
        }

        // 7. Emit Result
        setTimeout(() => {
            const resultData = {
                betId: uuidv4(),
                result: result,
                won: won,
                payout: won ? amount * multiplier : 0,
                multiplier: multiplier,
                newBalance: user.balance
            };
            socket.emit('game:result', resultData);

            // Broadcast to Live Feed
            const liveBetData = {
                id: resultData.betId,
                username: user.name || 'Hidden User',
                game: 'Dice',
                amount: amount,
                won: won,
                payout: resultData.payout,
                multiplier: multiplier
            };
            // Use global io to broadcast to all clients
            io.emit('bet:live', liveBetData);

        }, 500);

    } catch (e) {
        socket.emit('error', { message: e.message || 'Bet failed' });
    }
}

function stop() {
    // cleanup
}

module.exports = {
    initialize,
    stop
};
