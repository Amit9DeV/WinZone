const Bet = require('../../models/Bet.model');
const User = require('../../models/User.model');
// 6-Color Wheel Engine
// Segments: Red, Blue, Green, Yellow, Orange, Purple

const SEGMENTS = [
    { color: 'RED', multiplier: 2, weight: 40 },
    { color: 'BLUE', multiplier: 2, weight: 40 },
    { color: 'GREEN', multiplier: 3, weight: 20 },
    { color: 'YELLOW', multiplier: 3, weight: 20 },
    { color: 'ORANGE', multiplier: 5, weight: 10 },
    { color: 'PURPLE', multiplier: 5, weight: 10 }
];

const TOTAL_WEIGHT = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);

async function initialize(io, gameDoc) {
    if (!gameDoc) return;
    console.log(`[Wheel] Initializing...`);

    const nsp = io.of('/wheel');
    nsp.on('connection', (socket) => {
        console.log(`[Wheel] Client connected: ${socket.id}`);
        handleSocketConnection(socket, nsp);
    });
}

async function handleSocketConnection(socket, io) {
    socket.on('bet:place', async (data) => {
        try {
            // Auth Logic
            let userId = socket.request.user ? socket.request.user._id : null;

            // If checking from token or other source
            if (!userId) {
                const token = socket.handshake.auth.token;
                if (token) {
                    const jwt = require('jsonwebtoken');
                    const User = require('../../models/User.model');
                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
                        userId = decoded.userId;
                    } catch (e) { }
                }
            }
            if (!userId && data.userId) userId = data.userId;

            // Sanitize userId
            if (userId === 'undefined' || userId === 'null') userId = null;

            if (!userId) return socket.emit('error', 'Unauthorized');
            const User = require('../../models/User.model');
            let user = await User.findById(userId);
            if (!user) return socket.emit('error', 'Unauthorized');

            const amount = parseFloat(data.amount);
            if (!amount || amount <= 0) return socket.emit('error', 'Invalid amount');

            if (user.balance < amount) return socket.emit('error', 'Insufficient balance');

            const choice = data.color?.toUpperCase();
            if (!SEGMENTS.find(s => s.color === choice)) return socket.emit('error', 'Invalid color choice');

            // Deduct Balance
            const walletService = require('../../services/wallet.service');
            await walletService.updateBalance(user._id, -amount, 'Wheel Bet');
            const newBalance = await walletService.getBalance(user._id);
            socket.emit('user:balance', newBalance);

            // Spin Wheel (RNG)
            const random = Math.random() * TOTAL_WEIGHT;
            let currentWeight = 0;
            let resultSegment = SEGMENTS[0];

            for (const segment of SEGMENTS) {
                currentWeight += segment.weight;
                if (random < currentWeight) {
                    resultSegment = segment;
                    break;
                }
            }

            const resultColor = resultSegment.color;
            const multiplier = resultSegment.multiplier;
            const won = resultColor === choice;
            const payout = won ? amount * multiplier : 0;

            // Save Bet
            const bet = new Bet({
                userId: user._id,
                gameId: 'wheel',
                amount,
                multiplier: won ? multiplier : 0,
                payout,
                result: won ? 'WON' : 'LOST',
                cashedOut: won,
                metadata: { choice, result: resultColor, multiplier }
            });
            await bet.save();

            // Update Balance if Won
            if (won) {
                await walletService.updateBalance(user._id, payout, 'Wheel Win');
                const finalBalance = await walletService.getBalance(user._id);
                socket.emit('user:balance', finalBalance);
                user.balance = finalBalance;
            } else {
                user.balance = newBalance;
            }

            // Emit Result
            socket.emit('bet:result', {
                result: resultColor,
                multiplier: multiplier,
                won,
                payout,
                balance: user.balance
            });

        } catch (error) {
            console.error('[Wheel] Bet Error:', error);
            socket.emit('error', 'Bet processing failed');
        }
    });

    // Info
    socket.on('game:info', () => {
        socket.emit('game:info', { segments: SEGMENTS });
    });
}

module.exports = {
    initialize,
    handleSocketConnection
};
