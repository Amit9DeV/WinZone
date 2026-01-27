/**
 * Slots Game Engine
 * Classic 3-reel slot machine logic
 */

const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

// Symbols and their weights (simplified)
// Symbols and their weights (aligned with Frontend)
const SYMBOLS = ['🍒', '🍋', '⭐', '💎', '7️⃣', '🍀'];

// Payouts for 3-of-a-kind (Multiplier)
const PAYOUTS = {
    '🍒': 5,
    '🍋': 10,
    '⭐': 20,
    '💎': 50,
    '7️⃣': 100,
    '🍀': 200
};

let io = null;
let gameConfig = null;

async function initialize(socketIO, config) {
    io = socketIO;
    gameConfig = config;
    console.log('🎰 Initializing Slots Engine...');

    const nsp = io.of('/slots');

    nsp.on('connection', (socket) => {
        socket.on('bet:place', (data) => handleBet(socket, data));
    });

    console.log('✅ Slots Engine active');
}

/**
 * Handle Spin Request
 */
async function handleBet(socket, data) {
    try {
        let { userId, amount } = data;

        // Sanitize userId
        if (userId === 'undefined' || userId === 'null') userId = null;
        if (!userId) return socket.emit('error', { message: 'Unauthorized' });

        // 1. Validation
        const user = await User.findById(userId);
        if (!user) return socket.emit('error', { message: 'User not found' });
        if (user.balance < amount) return socket.emit('error', { message: 'Insufficient balance' });

        // 2. Logic: Spin 3 reels
        const reel1 = getRandomSymbol();
        const reel2 = getRandomSymbol();
        const reel3 = getRandomSymbol();
        const result = [reel1, reel2, reel3];

        // 3. Calculate Payout
        let multiplier = 0;
        let won = false;

        if (reel1 === reel2 && reel2 === reel3) {
            multiplier = PAYOUTS[reel1]; // 3 of a kind
            won = true;
        } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
            // 2 of a kind (Optional: Frontend payouts table doesn't show this, but keeping it small is fun)
            // Frontend says "Match 3!", paytable only shows 3 matches.
            // Let's remove 2-match win to match frontend strictness "Match 3!" subheading
            // multiplier = 1.2; 
            // won = true;
            multiplier = 0;
            won = false;
        }

        const payout = amount * multiplier;

        // 4. Update Database
        if (won) {
            user.balance += payout; // Add win
            user.totalWins += 1;
        } else {
            user.balance -= amount; // Deduct loss (wait, standard is deduct bet first? yes)
            // Actually usually we deduct bet amount immediately.
            // My previous code: user.balance = user.balance - amount + payout;
            // This works for both.
            user.totalLosses += 1;
        }
        // Let's stick to the atomic update logic
        user.balance = user.balance - amount + payout; // Net change

        user.totalBets += 1;
        user.totalWagered += amount;
        // Note: Schema has totalWagered, previous code had user.wagered (typo?)
        // User model has totalWagered.
        await user.save();

        const newBet = await Bet.create({
            userId: user._id,
            gameId: 'slots',
            amount,
            payout,
            result: won ? 'WON' : 'LOST',
            multiplier,
            metadata: {
                reels: result // Store symbols in metadata
            }
        });

        // 5. Send Result (Match Frontend "game:result" and payload)
        socket.emit('game:result', {
            id: newBet._id,
            symbols: result, // Frontend expects 'symbols'
            won: won,        // Frontend expects 'won' boolean
            payout,
            multiplier,
            balance: user.balance
        });

        // 6. Broadcast Live Bet
        io.emit('bet:live', {
            id: newBet._id,
            username: user.name,
            game: 'Slots',
            amount: amount,
            multiplier: multiplier,
            payout: payout,
            won: won
        });

    } catch (err) {
        console.error('Slots Error:', err);
        socket.emit('error', { message: 'Spin failed' });
    }
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

module.exports = { initialize };
