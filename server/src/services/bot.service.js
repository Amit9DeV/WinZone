const Settings = require('../models/Settings');
const User = require('../models/User.model');
const Bet = require('../models/Bet.model');
const { v4: uuidv4 } = require('uuid');

let botInterval = null;

// Bot Names
const BOT_NAMES = [
    "Vikram", "Rahul", "Amit", "Sneha", "Priya", "Rohan", "Karan", "Arjun", "Neha", "Anjali",
    "Suresh", "Ramesh", "Vijay", "Anita", "Sunita", "Raj", "Deepak", "Sanjay", "Manoj", "Pooja",
    "LuckyWinner", "ProGamer", "King123", "SkyHigh", "MoneyMaker", "BigWin", "FastCash",
    "EagleEye", "Pilot007", "TopGun", "Maverick", "Goose", "Iceman", "Viper", "Jester"
];

const GAMES = ['mines', 'dice', 'plinko', 'limbo', 'coin-flip', 'wheel', 'keno', 'slots'];

// Cache bot user IDs to avoid constant lookups
// Cache bot user IDs to avoid constant lookups
let botUserIds = [];

/**
 * Initialize Bot Service
 */
const initialize = async (io) => {
    console.log('🤖 Initializing User Activity Bots...');
    await ensureBotUsers();
    startBotLoop(io);
};

// Create persistent bot users in DB if they don't exist
const ensureBotUsers = async () => {
    try {
        botUserIds = [];
        for (const name of BOT_NAMES) {
            let user = await User.findOne({ email: `${name.toLowerCase()}@bot.com` });
            if (!user) {
                user = await User.create({
                    name: name,
                    email: `${name.toLowerCase()}@bot.com`,
                    password: 'bot-password-123', // Dummy
                    role: 'USER',
                    isBanned: false,
                    balance: 100000, // Infinite money for bots
                    avatar: `/avatars/av-${Math.floor(Math.random() * 7) + 1}.png`
                });
                console.log(`🤖 Created new bot user: ${name}`);
            }
            botUserIds.push(user._id);
        }
        console.log(`✅ Loaded ${botUserIds.length} bot users`);
    } catch (e) {
        console.error('❌ Failed to ensure bot users:', e);
    }
};

const startBotLoop = (io) => {
    // Run every 2-8 seconds randomly
    const run = async () => {
        try {
            const settings = await Settings.getSettings();
            if (!settings.botConfig?.enabled) {
                // If disabled, check again in 10s
                setTimeout(run, 10000);
                return;
            }

            // Pick a random game
            const gameId = GAMES[Math.floor(Math.random() * GAMES.length)];
            const config = settings.botConfig.games[gameId];


            // Validate config
            const cleanId = gameId.replace('-', '');
            const gameConfig = settings.botConfig.games[cleanId] || settings.botConfig.games[gameId];

            if (gameConfig && gameConfig.enabled && botUserIds.length > 0) {
                // Pick random bot user
                const botUserId = botUserIds[Math.floor(Math.random() * botUserIds.length)];
                const botUser = await User.findById(botUserId); // Fetch to get name/avatar

                if (!botUser) return; // Safety

                // Generate Bet Details
                const amount = Math.floor(Math.random() * (gameConfig.maxBet - gameConfig.minBet) + gameConfig.minBet);
                const multiplier = (Math.random() * 5 + 1.1).toFixed(2);
                const payout = Math.floor(amount * multiplier);
                const won = Math.random() > 0.4;
                const result = won ? 'win' : 'loss';

                // 1. SAVE TO DB (So they appear on Leaderboard)
                await Bet.create({
                    userId: botUserId,
                    gameId: gameId,
                    amount: amount,
                    result: result, // Leaderboard checks 'win' or 'loss' usually? 
                    // Leaderboard aggregator checks: $cond: [{ $eq: ['$result', 'win'] }, '$payout', 0]
                    // Wait, aggregator used 'win' lowercase. 
                    // Let's ensure consistent enum. Usually it's 'WON', 'LOST' uppercase in other engines.
                    // Let's double check leaderboard first. Leaderboard uses 'win'. 
                    // Let's stick to 'win'/'loss' or fix leaderboard. 
                    // Dice engine uses 'WON'. We should aligned.
                    // Actually, let's try to match Dice engine: 'WON'/'LOST'.
                    // And I will update leaderboard to match 'WON'.
                    result: won ? 'WON' : 'LOST',
                    payout: won ? payout : 0,
                    multiplier: won ? multiplier : 0,
                    metadata: { type: 'bot_auto' }
                });

                // Update Bot Stats (Optional, but good for realism)
                botUser.totalBets += 1;
                botUser.totalWagered += amount;
                if (won) {
                    botUser.totalWins += 1;
                    botUser.balance += payout; // They accumulate money (or lose it)
                } else {
                    botUser.totalLosses += 1;
                    botUser.balance -= amount;
                }
                // Reset balance if too low
                if (botUser.balance < 1000) botUser.balance = 50000;
                await botUser.save();


                // 2. EMIT TO LIVE FEED
                io.emit('bet:live', {
                    id: uuidv4(),
                    username: botUser.name,
                    game: gameConfig.name || gameId,
                    amount: amount,
                    won: won,
                    payout: won ? payout : 0,
                    multiplier: multiplier
                });

                // Game specific channel
                io.of(`/${gameId}`).emit('game:log', {
                    user: botUser.name,
                    amount: amount,
                    won: won ? payout : 0
                });
            }

        } catch (e) {
            console.error('Bot Loop Error:', e);
        }

        const nextDelay = Math.random() * 3000 + 1000;
        setTimeout(run, nextDelay);
    };

    run();
};

module.exports = { initialize };
