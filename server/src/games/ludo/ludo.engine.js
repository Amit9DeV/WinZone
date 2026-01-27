const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');
const walletService = require('../../services/wallet.service');

let IO = null;
const activeLudoGames = new Map(); // RoomId -> GameState

const initialize = (io, gameConfig) => {
    IO = io;
    const nsp = io.of('/ludo');

    nsp.on('connection', (socket) => {
        socket.emit('init', { message: 'Ludo Engine Connected' });

        // Create Game Room (Host)
        socket.on('game:create', async (data) => {
            try {
                const { betAmount, userId } = data;

                // Validate
                if (!betAmount || betAmount <= 0) return socket.emit('error', 'Invalid bet');
                const user = await User.findById(userId);
                if (!user || user.balance < betAmount) return socket.emit('error', 'Insufficient balance');

                // Deduct Balance (Escrow)
                await walletService.updateBalance(userId, -betAmount, 'Ludo Buy-in');

                // Create Pending Bet
                const newBet = await Bet.create({
                    userId: user._id,
                    gameId: 'ludo',
                    amount: betAmount,
                    result: 'PENDING',
                    metadata: { role: 'HOST' }
                });

                const roomId = uuidv4().slice(0, 6).toUpperCase();

                activeLudoGames.set(roomId, {
                    id: roomId,
                    hostId: userId,
                    betAmount,
                    players: [{ userId, socketId: socket.id, color: 'RED' }],
                    status: 'WAITING',
                    betIds: [newBet._id]
                });

                socket.join(roomId);
                socket.emit('game:created', { roomId, betAmount, balance: await walletService.getBalance(userId) });

            } catch (e) {
                console.error('Ludo Create Error:', e);
                socket.emit('error', 'Failed to create game');
            }
        });

        // Join Game (Peer)
        socket.on('game:join', async (data) => {
            try {
                const { roomId, userId } = data;
                const game = activeLudoGames.get(roomId);

                if (!game) return socket.emit('error', 'Game not found');
                if (game.status !== 'WAITING') return socket.emit('error', 'Game already started');
                if (game.players.length >= 4) return socket.emit('error', 'Room full');

                // Validate Joiner
                const user = await User.findById(userId);
                if (!user || user.balance < game.betAmount) return socket.emit('error', 'Insufficient balance');

                // Deduct Balance
                await walletService.updateBalance(userId, -game.betAmount, 'Ludo Buy-in');

                // Create Pending Bet
                const newBet = await Bet.create({
                    userId: user._id,
                    gameId: 'ludo',
                    amount: game.betAmount,
                    result: 'PENDING',
                    metadata: { role: 'PLAYER', roomId }
                });

                game.players.push({ userId, socketId: socket.id, color: ['GREEN', 'BLUE', 'YELLOW'][game.players.length - 1] });
                game.betIds.push(newBet._id);

                socket.join(roomId);
                nsp.to(roomId).emit('player:joined', { userId, playerCount: game.players.length });

                // Simple auto-start for 2 players MVP
                if (game.players.length === 2) {
                    game.status = 'PLAYING';
                    nsp.to(roomId).emit('game:started', { gameId: roomId });
                }

            } catch (e) {
                console.error('Ludo Join Error:', e);
                socket.emit('error', 'Failed to join game');
            }
        });

        // Placeholder for Win Logic (Simulated for persistence proof)
        socket.on('game:win', async (data) => {
            // In real ludo, server validates moves. Here we trust for MVP persistence check.
            const { roomId, winnerId } = data;
            const game = activeLudoGames.get(roomId);
            if (!game) return;

            const totalPot = game.betAmount * game.players.length;
            const platformFee = totalPot * 0.10; // 10% fee
            const winAmount = totalPot - platformFee;

            // Payout Winner
            await walletService.updateBalance(winnerId, winAmount, 'Ludo Win');

            // Update Winner Stats
            await User.findByIdAndUpdate(winnerId, { $inc: { totalWins: 1, biggestWin: winAmount } });

            // Update Bet Records
            for (const betId of game.betIds) {
                const bet = await Bet.findById(betId);
                if (bet.userId.toString() === winnerId) {
                    bet.result = 'WON';
                    bet.payout = winAmount;
                    bet.multiplier = (winAmount / bet.amount).toFixed(2);
                } else {
                    bet.result = 'LOST';
                    bet.payout = 0;
                }
                await bet.save();
            }

            nsp.to(roomId).emit('game:over', { winnerId, winAmount });
            activeLudoGames.delete(roomId);
        });
    });
};

module.exports = { initialize };
