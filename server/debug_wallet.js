const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ DNS forcefully set to Google DNS');
} catch (e) { }

require('dotenv').config();
const mongoose = require('mongoose');
const walletService = require('./src/services/wallet.service');
const User = require('./src/models/User.model');
const WalletRequest = require('./src/models/WalletRequest.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/winzone';

async function runDebug() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Find a user
        const user = await User.findOne();
        if (!user) {
            console.log('No users found to test with.');
            return;
        }
        console.log('Testing with User:', user.name, user._id);

        // 2. Test getBalance
        try {
            console.log('Testing getBalance...');
            const balance = await walletService.getBalance(user._id);
            console.log('Balance:', balance);
        } catch (err) {
            console.error('getBalance Failed:', err);
        }

        // 3. Test request creation
        try {
            console.log('Testing requestBalance...');
            const req = await walletService.requestBalance(user._id, 100);
            console.log('Request Created:', req._id);


            // 4. Test approveRequest (simulate admin)
            try {
                console.log('Testing approveRequest...');
                const approved = await walletService.approveRequest(req._id, user._id, 'Debug approval');
                console.log('Request Approved:', approved.status);
            } catch (err) {
                console.error('approveRequest Failed:', err);
            }

        } catch (err) {
            console.error('requestBalance Failed:', err);
        }

    } catch (error) {
        console.error('Global Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runDebug();
