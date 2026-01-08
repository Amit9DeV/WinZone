const mongoose = require('mongoose');
const Game = require('./src/models/Game.model');
require('dotenv').config();

const checkGames = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const games = await Game.find({});
        console.log('Games found:', JSON.stringify(games, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkGames();
