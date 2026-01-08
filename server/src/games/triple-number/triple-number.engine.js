const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

let IO = null;
let GAME_STATE = 'IDLE'; // IDLE, BETTING, RESULT
let TIMER = 20; // 20 seconds loop
let ACTIVE_BETS = []; // { userId, selection: [1,2,3], amount }
let HISTORY = []; // Last 50 results

/* 
    Triple Number Logic:
    - User picks 1, 2, or 3 numbers from [1, 2, 3].
    - Server generates 3 random numbers (e.g., 1, 3, 2) or just 1?
    - "Pick 1-3 numbers" usually means guessing the outcome of a draw.
    - Let's assume simplest version: Server draws ONE number (1, 2, or 3).
    - User bets on 1, 2, or 3.
    - Payout: x2.8 (House edge)
*/

const initialize = (io, gameConfig) => {
    IO = io;
    startLoop();

    const nsp = io.of('/triple-number');

    nsp.on('connection', (socket) => {
        socket.emit('init', {
            timer: TIMER,
            gameState: GAME_STATE,
            history: HISTORY.slice(0, 20)
        });

        socket.on('bet:place', async (data) => {
            if (GAME_STATE !== 'BETTING') return socket.emit('error', { message: 'Betting closed' });

            // Single Bet Enforcement
            const existingBet = ACTIVE_BETS.find(b => b.userId === data.userId);
            if (existingBet) return socket.emit('error', { message: 'Only 1 bet per round allowed' });
            if (![1, 2, 3].includes(data.selection)) return socket.emit('error', { message: 'Invalid selection' });

            try {
                const user = await User.findById(data.userId);
                if (!user || user.balance < data.amount) return socket.emit('error', { message: 'Insufficient balance' });

                user.balance -= data.amount;
                user.wagered += data.amount;
                user.totalBets += 1;
                await user.save();

                // Create Persistent Bet
                const newBet = await Bet.create({
                    userId: user._id,
                    gameId: 'triple-number',
                    amount: data.amount,
                    result: 'PENDING',
                    metadata: { selection: data.selection }
                });

                ACTIVE_BETS.push({
                    _id: newBet._id,
                    userId: data.userId,
                    selection: data.selection,
                    amount: data.amount,
                    socketId: socket.id
                });

                socket.emit('bet:confirmed', { balance: user.balance });
            } catch (err) {
                socket.emit('error', { message: 'Bet failed' });
            }
        });
    });
};

const startLoop = () => {
    GAME_STATE = 'BETTING';
    TIMER = 15;
    ACTIVE_BETS = [];

    const interval = setInterval(async () => {
        TIMER--;
        IO.of('/triple-number').emit('timer', { timer: TIMER, gameState: GAME_STATE });

        if (TIMER <= 0) {
            clearInterval(interval);
            if (GAME_STATE === 'BETTING') {
                GAME_STATE = 'RESULT';
                TIMER = 5;

                // Result Generation: 1, 2, or 3
                const result = Math.floor(Math.random() * 3) + 1;

                HISTORY.unshift({ result, time: Date.now() });
                if (HISTORY.length > 50) HISTORY.pop();

                // Payouts
                // Payouts
                for (const bet of ACTIVE_BETS) {
                    if (bet.selection === result) {
                        const payout = bet.amount * 2.8;
                        try {
                            const user = await User.findById(bet.userId);
                            if (user) {
                                user.balance += payout;
                                user.totalWins += 1;
                                await user.save();

                                // Update Bet (Win)
                                await Bet.findByIdAndUpdate(bet._id, {
                                    result: 'WON',
                                    payout: payout,
                                    multiplier: 2.8
                                });

                                IO.of('/triple-number').to(bet.socketId).emit('bet:win', { amount: payout, balance: user.balance });
                            }
                        } catch (e) { console.error(e); }
                    } else {
                        // Update Bet (Loss)
                        try {
                            await Bet.findByIdAndUpdate(bet._id, {
                                result: 'LOST',
                                payout: 0
                            });
                            // Notify User of Loss
                            const userBalance = await User.findById(bet.userId).select('balance').lean().then(u => u?.balance);
                            IO.of('/triple-number').to(bet.socketId).emit('bet:loss', { amount: bet.amount, balance: userBalance });
                        } catch (e) { }
                    }
                }

                IO.of('/triple-number').emit('game:result', { result, history: HISTORY.slice(0, 10) });

                setTimeout(startLoop, 5000);
            }
        }
    }, 1000);
};

module.exports = { initialize };
