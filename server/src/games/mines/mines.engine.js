/**
 * Mines Game Engine
 * Server-side grid management and cashout logic
 */
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

// In-memory partial state for active games (PROD: Use Redis)
const activeGames = new Map();

function initialize(io, config) {
    const nsp = io.of('/mines');

    nsp.on('connection', (socket) => {

        // Start Game (Bet)
        socket.on('game:start', async (data) => {
            try {
                const { userId, betAmount, mineCount } = data;

                // 1. Validation
                if (activeGames.has(socket.id)) {
                    // Cleanup old game if exists
                    activeGames.delete(socket.id);
                }

                if (betAmount < 10) throw new Error('Min bet is 10');
                if (mineCount < 1 || mineCount > 24) throw new Error('Invalid mines');

                // 2. Transact User
                const user = await User.findById(userId);
                if (!user || user.balance < betAmount) throw new Error('Insufficient balance');

                user.balance -= betAmount;
                user.totalBets += 1;
                user.totalWagered += betAmount;
                await user.save();

                // 3. Generate Mines (Server Side Only!)
                const mines = new Set();
                while (mines.size < mineCount) {
                    mines.add(Math.floor(Math.random() * 25)); // 0-24
                }

                // 4. Store State
                const gameId = uuidv4();

                // Create Persistent Bet
                const bet = await Bet.create({
                    userId: user._id,
                    gameId: 'mines',
                    amount: betAmount,
                    result: 'PENDING',
                    metadata: { mineCount, mines: Array.from(mines) } // Store mine map for verification
                });

                activeGames.set(socket.id, {
                    gameId,
                    betId: bet._id,
                    userId,
                    betAmount,
                    mineCount,
                    mines, // Set of indices
                    revealed: new Set(),
                    state: 'PLAYING',
                    startTime: Date.now()
                });

                // 5. Emit Initial "Hidden" Grid
                socket.emit('game:started', {
                    gameId,
                    balance: user.balance,
                    grid: Array(25).fill({ revealed: false })
                });

            } catch (e) {
                socket.emit('error', { message: e.message });
            }
        });

        // Reveal Tile
        socket.on('game:reveal', async (data) => {
            const game = activeGames.get(socket.id);
            if (!game || game.state !== 'PLAYING') return;

            const { index } = data;
            if (game.revealed.has(index)) return;

            // Check if mine
            if (game.mines.has(index)) {
                // BOOM
                game.state = 'LOST';

                // Fetch user to update stats
                const user = await User.findById(game.userId);
                if (user) {
                    user.totalLosses += 1;
                    await user.save();
                }

                // Update Bet
                await Bet.findByIdAndUpdate(game.betId, {
                    result: 'LOST',
                    payout: 0,
                    cashedOut: false
                });

                socket.emit('game:over', {
                    won: false,
                    mines: Array.from(game.mines), // Reveal all mines
                    payout: 0
                });

                activeGames.delete(socket.id);

            } else {
                // GEM
                game.revealed.add(index);

                // Calculate Multiplier
                const remainingSafeTiles = 25 - game.mineCount - (game.revealed.size - 1);
                const moves = game.revealed.size;
                const multiplier = (1 + (moves * 0.15 * game.mineCount)).toFixed(2);
                const currentPayout = (game.betAmount * parseFloat(multiplier));

                socket.emit('tile:revealed', {
                    index,
                    isMine: false,
                    multiplier,
                    currentPayout
                });

                // Check Auto-Win (All gems found)
                if (game.revealed.size === (25 - game.mineCount)) {
                    handleCashout(socket, game, true);
                }
            }
        });

        // Cashout
        socket.on('game:cashout', async () => {
            const game = activeGames.get(socket.id);
            if (!game || game.state !== 'PLAYING') return;
            await handleCashout(socket, game, false);
        });

    });
}

async function handleCashout(socket, game, autoStr = false) {
    game.state = 'CASHED_OUT';

    // Recalculate Payout to be safe
    const moves = game.revealed.size;
    if (moves === 0) return; // Cannot cashout without moves

    const multiplier = (1 + (moves * 0.15 * game.mineCount)).toFixed(2);
    const payout = Math.floor(game.betAmount * parseFloat(multiplier));

    try {
        const user = await User.findById(game.userId);
        if (user) {
            user.balance += payout;
            user.totalWins += 1;
            user.biggestWin = Math.max(user.biggestWin, payout);
            await user.save();

            // Update Bet
            await Bet.findByIdAndUpdate(game.betId, {
                result: 'WON',
                payout: payout,
                multiplier: parseFloat(multiplier),
                cashedOut: true,
                cashedOutAt: Date.now()
            });

            socket.emit('game:over', {
                won: true,
                payout,
                multiplier,
                balance: user.balance,
                mines: Array.from(game.mines) // Reveal map
            });
        }
    } catch (e) {
        console.error('Mines Cashout Error', e);
    }

    activeGames.delete(socket.id);
}

module.exports = { initialize };
