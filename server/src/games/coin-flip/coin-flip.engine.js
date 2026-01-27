const Bet = require('../../models/Bet.model');
const User = require('../../models/User.model');
// Coin Flip Engine
// Simple 50/50 Game
// User bets on 'HEADS' or 'TAILS'
// Payout: 1.92x

const PAYOUT_MULTIPLIER = 1.92;

async function initialize(io, gameDoc) {
    if (!gameDoc) return;
    console.log(`[CoinFlip] Initializing...`);

    const nsp = io.of('/coin-flip');
    nsp.on('connection', (socket) => {
        console.log(`[CoinFlip] Client connected: ${socket.id}`);
        handleSocketConnection(socket, nsp);
    });
}

async function handleSocketConnection(socket, io) {
    socket.on('bet:place', async (data) => {
        // data: { amount: number, choice: 'HEADS' | 'TAILS' }
        try {
            // Auth Logic
            // Auth Logic
            let userId = data.userId || socket.userId;

            if (!userId) {
                // Fallback: try handshake query if not set on socket object yet
                userId = socket.handshake.query.userId;
            }

            // Sanitize
            if (userId === 'undefined' || userId === 'null') userId = null;

            if (!userId) return socket.emit('error', 'Unauthorized');

            const User = require('../../models/User.model');
            const user = await User.findById(userId);

            if (!user) return socket.emit('error', 'Unauthorized');

            const amount = parseFloat(data.amount);
            if (!amount || amount <= 0) return socket.emit('error', 'Invalid amount');

            if (user.balance < amount) return socket.emit('error', 'Insufficient balance');

            const choice = data.choice?.toUpperCase();
            if (!['HEADS', 'TAILS'].includes(choice)) return socket.emit('error', 'Invalid choice (HEADS/TAILS)');

            // Deduct Balance
            const walletService = require('../../services/wallet.service');
            await walletService.updateBalance(user._id, -amount, 'Coin Flip Bet');

            // Notify Balance Update
            const newBalance = await walletService.getBalance(user._id);
            socket.emit('user:balance', newBalance);

            // Determine Result
            const isHeads = Math.random() < 0.5;
            const result = isHeads ? 'HEADS' : 'TAILS';
            const won = result === choice;
            const payout = won ? amount * PAYOUT_MULTIPLIER : 0;

            // Create Bet Record
            const bet = new Bet({
                userId: user._id,
                gameId: 'coin-flip',
                amount,
                multiplier: won ? PAYOUT_MULTIPLIER : 0,
                payout,
                result: won ? 'WON' : 'LOST',
                cashedOut: won, // Instant win = cashed out effectively
                metadata: { choice, result }
            });
            await bet.save();

            // Update User Balance if Won
            if (won) {
                await walletService.updateBalance(user._id, payout, 'Coin Flip Win');
                const finalBalance = await walletService.getBalance(user._id);
                socket.emit('user:balance', finalBalance);

                // Re-fetch balance for final emit just to be sure
                user.balance = finalBalance;
            } else {
                user.balance = newBalance;
            }

            // Emit Result
            socket.emit('bet:result', {
                result, // 'HEADS' or 'TAILS'
                won,
                payout,
                balance: user.balance
            });

        } catch (error) {
            console.error('[CoinFlip] Bet Error:', error);
            socket.emit('error', 'Bet processing failed');
        }
    });
}

module.exports = {
    initialize,
    handleSocketConnection
};
