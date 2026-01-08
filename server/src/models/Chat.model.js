const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: {
        type: String,
        default: '',
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['normal', 'gif'],
        default: 'normal',
    },
    likesIDs: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Auto-delete after 24 hours to keep DB light
    },
});

module.exports = mongoose.model('Chat', chatSchema);
