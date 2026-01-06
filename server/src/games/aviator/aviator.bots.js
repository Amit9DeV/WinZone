/**
 * Aviator Bot Logic
 * Generates fake bets and cashouts to simulate activity
 */

const names = [
    "Vikram", "Rahul", "Amit", "Sneha", "Priya", "Rohan", "Karan", "Arjun", "Neha", "Anjali",
    "Suresh", "Ramesh", "Vijay", "Anita", "Sunita", "Raj", "Deepak", "Sanjay", "Manoj", "Pooja",
    "LuckyWinner", "ProGamer", "AviatorKing", "SkyHigh", "MoneyMaker", "BigWin", "FastCash",
    "EagleEye", "Pilot007", "TopGun", "Maverick", "Goose", "Iceman", "Viper", "Jester",
    "User888", "Player1", "Winner2024", "CryptoKing", "BtcLover", "EthFan", "DogeCoin",
    "RichieRich", "Millionaire", "Billionaire", "Trillionaire", "Gazillionaire",
    "Alpha", "Beta", "Gamma", "Delta", "Omega", "Sigma", "Zeta", "Theta", "Iota", "Kappa"
];

const avatars = [
    "/avatars/av-1.png",
    "/avatars/av-2.png",
    "/avatars/av-3.png",
    "/avatars/av-4.png",
    "/avatars/av-5.png",
    "/avatars/av-6.png",
    "/avatars/av-7.png",
];

let activeBots = [];

/**
 * Generate random bots for a new round
 */
function placeBets(roundId) {
    activeBots = [];
    const count = 15 + Math.floor(Math.random() * 25); // 15-40 bots

    for (let i = 0; i < count; i++) {
        const betAmount = generateBetAmount();
        const target = generateTargetMultiplier();

        activeBots.push({
            id: `bot-${i}-${Date.now()}`,
            name: names[Math.floor(Math.random() * names.length)],
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            betAmount: betAmount,
            target: target, // Pre-determined cashout point
            cashouted: false,
            cashOut: 0,
            isBot: true,
        });
    }

    return activeBots;
}

/**
 * Update bots based on current multiplier
 * Returns true if any bot cashed out
 */
function updateBots(currentMultiplier) {
    let changed = false;

    activeBots.forEach(bot => {
        if (!bot.cashouted && currentMultiplier >= bot.target) {
            bot.cashouted = true;
            bot.cashOut = (bot.betAmount * bot.target).toFixed(2);
            changed = true;
        }
    });

    return changed;
}

/**
 * Get all active bots
 */
function getBots() {
    return activeBots;
}

/**
 * Helper: Generate realistic bet amount
 */
function generateBetAmount() {
    const rand = Math.random();
    if (rand < 0.5) return (10 + Math.floor(Math.random() * 90)); // 10-100
    if (rand < 0.8) return (100 + Math.floor(Math.random() * 400)); // 100-500
    if (rand < 0.95) return (500 + Math.floor(Math.random() * 500)); // 500-1000
    return (1000 + Math.floor(Math.random() * 4000)); // 1000-5000 (High rollers)
}

/**
 * Helper: Generate realistic target multiplier
 */
function generateTargetMultiplier() {
    const rand = Math.random();
    if (rand < 0.4) return 1.1 + Math.random() * 0.4; // 1.1 - 1.5 (Safe players)
    if (rand < 0.7) return 1.5 + Math.random() * 1.5; // 1.5 - 3.0 (Moderate)
    if (rand < 0.9) return 3.0 + Math.random() * 7.0; // 3.0 - 10.0 (Risky)
    return 10.0 + Math.random() * 90.0; // 10+ (Dreamers)
}

module.exports = {
    placeBets,
    updateBots,
    getBots,
};
