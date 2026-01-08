const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

let IO = null;

const initialize = (io, gameConfig) => {
    IO = io;
    const nsp = io.of('/ludo');

    nsp.on('connection', (socket) => {
        socket.emit('init', { message: 'Ludo Engine Connected' });

        socket.on('join_game', async (data) => {
            // Placeholder for joining logic
        });
    });
};

module.exports = { initialize };
