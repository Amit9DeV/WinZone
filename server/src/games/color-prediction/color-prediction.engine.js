const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');
const { v4: uuidv4 } = require('uuid');

let IO = null;
let GAME_STATE = 'IDLE'; // IDLE, BETTING, RESULT
let CURRENT_PERIOD_ID = null;
let NEXT_PERIOD_ID = null;
let TIMER = 30; // 30 seconds
let ACTIVE_BETS = []; // Local cache for fast processing
let HISTORY = []; // Last 50 results

/* 
    Game Logic:
    30s Loop:
    - 25s Betting Open
    - 5s Betting Closed (Result Generation)
    
    Colors:
    - Green: 1, 3, 7, 9 (Reward x2)
    - Red: 2, 4, 6, 8 (Reward x2)
    - Violet: 0, 5 (Reward x4.5) - Actually 0 is Red+Violet, 5 is Green+Violet
    
    Standard Parity Rules:
    - If Result 1,3,7,9: Green Wins
    - If Result 2,4,6,8: Red Wins
    - If Result 0: Red + Violet Win
    - If Result 5: Green + Violet Win
    
    Payouts:
    - Select Correct Color (Red/Green): 2x (If Violet appears, 1.5x)
    - Select Violet: 4.5x
    - Select Correct Number: 9x
*/

const COLORS = {
    0: ['red', 'violet'],
    1: ['green'],
    2: ['red'],
    3: ['green'],
    4: ['red'],
    5: ['green', 'violet'],
    6: ['red'],
    7: ['green'],
    8: ['red'],
    9: ['green']
};

const initialize = (io, gameConfig) => {
    IO = io;
    startLoop();

    const nsp = io.of('/color-prediction');

    nsp.on('connection', async (socket) => {
        // Fetch User's last 20 bets
        let userHistory = [];
        if (socket.handshake.query.userId) { // If userId passed in query
            // Implementation hint: Clients must pass userId in query for this to work perfectly on connect
            // or we rely on them reacting to events.
        }

        // Send initial state
        socket.emit('init', {
            periodId: CURRENT_PERIOD_ID,
            timer: TIMER,
            gameState: GAME_STATE,
            history: HISTORY.slice(0, 20) // Send last 20
        });

        socket.on('bet:place', async (data) => {
            // data: { userId, selection: 'red'|'green'|'violet'|0-9, amount }
            if (GAME_STATE !== 'BETTING') return socket.emit('error', { message: 'Betting is closed' });

            // Check if user already bet
            const existingBet = ACTIVE_BETS.find(b => b.userId === data.userId);
            if (existingBet) return socket.emit('error', { message: 'You have already placed a bet for this round' });

            try {
                const user = await User.findById(data.userId);
                if (!user) return socket.emit('error', { message: 'User not found' });
                if (user.balance < data.amount) return socket.emit('error', { message: 'Insufficient balance' });

                // Deduct Balance
                user.balance -= data.amount;
                user.wagered += data.amount;
                user.totalBets += 1;
                await user.save();

                // Create Persistent Bet
                const newBet = await Bet.create({
                    userId: user._id,
                    gameId: 'color-prediction',
                    roundId: CURRENT_PERIOD_ID,
                    amount: data.amount,
                    result: 'PENDING',
                    metadata: { selection: data.selection }
                });

                // Record Bet Locally
                ACTIVE_BETS.push({
                    _id: newBet._id,
                    userId: data.userId,
                    selection: data.selection,
                    amount: data.amount,
                    socketId: socket.id
                });

                // Confirm Bet
                socket.emit('bet:confirmed', { balance: user.balance, bet: newBet });

                // Fetch updated history? Client can just append locally.

            } catch (err) {
                console.error('Bet Error:', err);
                socket.emit('error', { message: 'Bet failed' });
            }
        });

        socket.on('history:fetch', async ({ userId }) => {
            try {
                const history = await Bet.find({ userId, gameId: 'color-prediction' })
                    .sort({ createdAt: -1 })
                    .limit(20);
                socket.emit('history:data', history);
            } catch (e) { console.error(e); }
        });
    });
};

const startLoop = () => {
    CURRENT_PERIOD_ID = Date.now().toString(); // Simple timestamp ID
    GAME_STATE = 'BETTING';
    TIMER = 25; // 25s for betting
    ACTIVE_BETS = [];

    const interval = setInterval(async () => {
        TIMER--;

        // Broadcast Tick
        IO.of('/color-prediction').emit('timer', { timer: TIMER, gameState: GAME_STATE });

        if (TIMER <= 0) {
            clearInterval(interval);
            if (GAME_STATE === 'BETTING') {
                // Close Betting
                GAME_STATE = 'RESULT';
                TIMER = 5; // 5s for animation/result

                // Calculate Result
                const resultNumber = Math.floor(Math.random() * 10);
                const resultColors = COLORS[resultNumber];

                // Archive
                const resultData = {
                    periodId: CURRENT_PERIOD_ID,
                    number: resultNumber,
                    colors: resultColors
                };
                HISTORY.unshift(resultData);
                if (HISTORY.length > 50) HISTORY.pop();

                // Process Payouts
                await processPayouts(resultNumber, resultColors);

                // Broadcast Result
                IO.of('/color-prediction').emit('game:result', {
                    result: resultData,
                    history: HISTORY.slice(0, 10)
                });

                // Restart Loop after 5s
                setTimeout(startLoop, 5000);
            }
        }
    }, 1000);
};

const processPayouts = async (number, colors) => {
    for (const bet of ACTIVE_BETS) {
        let winMultiplier = 0;

        // Check Color Match
        // Simplified Rule: 
        // If Result includes selection (e.g. Result is Red+Violet, User picked Red) -> WIN
        // Red/Green: 2x
        // Violet: 4.5x

        if (colors.includes(bet.selection)) {
            if (bet.selection === 'violet') {
                winMultiplier = 4.5;
            } else {
                // Simplified: User gets 2x regardless if Violet is present or not
                winMultiplier = 2;
            }
        }

        if (winMultiplier > 0) {
            const payout = bet.amount * winMultiplier;
            try {
                // Update User
                const user = await User.findById(bet.userId);
                if (user) {
                    user.balance += payout;
                    user.totalWins += 1;
                    if (payout > user.biggestWin) user.biggestWin = payout;
                    await user.save();

                    // Update Bet
                    await Bet.findByIdAndUpdate(bet._id, {
                        result: 'WON',
                        payout: payout,
                        multiplier: winMultiplier
                    });

                    // Notify User
                    // We can emit to specific socket if we tracked it, or just let client poll/handle balance update
                    if (IO) IO.of('/color-prediction').to(bet.socketId).emit('bet:win', { amount: payout, balance: user.balance });
                }
            } catch (err) {
                console.error('Payout Error:', err);
            }
        } else {
            // Record Loss
            try {
                await Bet.findByIdAndUpdate(bet._id, {
                    result: 'LOST',
                    payout: 0
                });
                if (IO) IO.of('/color-prediction').to(bet.socketId).emit('bet:loss', { amount: bet.amount, balance: await User.findById(bet.userId).select('balance').lean().then(u => u?.balance) });
            } catch (e) { console.error('Error updating lost bet:', e); }
        }
    }
};

module.exports = { initialize };
