/**
 * Backfill User Stats
 * Recalculates totalWon for all users based on Bet history.
 * Usage: node scripts/backfillStats.js
 */

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ DNS forcefully set to Google DNS (8.8.8.8)');
} catch (error) {
    console.log('⚠️ Failed to set custom DNS:', error.message);
}

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Bet = require('../src/models/Bet.model');
const UserGameStats = require('../src/models/UserGameStats.model'); // If separate model exists

const URI = "mongodb+srv://kumararyanbhai90_db_user:OLWWaYG0UFYFlfJW@cluster0.ohypbqc.mongodb.net/WinZone?appName=Cluster0";

async function backfill() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(URI);
        console.log('✅ Connected.');

        const users = await User.find();
        console.log(`👥 Found ${users.length} users. Processing...`);

        for (const user of users) {
            console.log(`Processing user: ${user.name} (${user._id})`);

            const bets = await Bet.find({ userId: user._id, result: 'WON' });
            let totalWon = 0;

            for (const bet of bets) {
                totalWon += bet.payout || 0;
            }

            // Also recalculate totalWagered for accuracy
            const allBets = await Bet.find({ userId: user._id });
            let totalWagered = 0;
            let totalWins = 0;
            let totalLosses = 0;

            for (const bet of allBets) {
                totalWagered += bet.amount || 0;
                if (bet.result === 'WON') totalWins++;
                else if (bet.result === 'LOST') totalLosses++;
            }

            console.log(`   -> Total Won: ${totalWon}`);
            console.log(`   -> Total Wagered: ${totalWagered}`);

            user.totalWon = totalWon;
            user.totalWagered = totalWagered;
            user.totalWins = totalWins;
            user.totalLosses = totalLosses;
            user.totalBets = allBets.length;
            if (user.totalBets > 0) {
                user.winPercentage = (totalWins / user.totalBets) * 100;
            } else {
                user.winPercentage = 0;
            }

            await user.save();
        }

        console.log('✅ Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

backfill();
