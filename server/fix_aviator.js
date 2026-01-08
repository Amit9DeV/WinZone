const mongoose = require('mongoose');
const Game = require('./src/models/Game.model');
require('dotenv').config();

const fixAviator = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const game = await Game.findOne({ gameId: 'aviator' });
        if (game) {
            console.log(`Current status: ${game.enabled}`);
            if (!game.enabled) {
                game.enabled = true;
                await game.save();
                console.log('✅ Aviator game enabled successfully');
            } else {
                console.log('ℹ️ Aviator is already enabled');
            }
        } else {
            console.log('❌ Aviator game not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAviator();
