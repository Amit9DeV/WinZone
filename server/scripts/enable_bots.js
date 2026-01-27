const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ DNS forcefully set to Google DNS (8.8.8.8)');
} catch (error) {
    console.log('⚠️ Failed to set custom DNS:', error.message);
}

const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('../src/models/Settings');
const { connectDB } = require('../src/config/database');

const enableBots = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const settings = await Settings.getSettings();
        console.log('Current Settings:', JSON.stringify(settings.botConfig));

        settings.botConfig.enabled = true;

        // Ensure all games are enabled too just in case
        for (const game in settings.botConfig.games) {
            if (settings.botConfig.games[game]) {
                settings.botConfig.games[game].enabled = true;
            }
        }

        await settings.save();
        console.log('Updated Settings: Bot Config Enabled = TRUE');
        console.log('New Settings:', JSON.stringify(settings.botConfig));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

enableBots();
