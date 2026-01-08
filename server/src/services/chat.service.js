const Chat = require('../models/Chat.model');

/**
 * Save a new chat message
 */
exports.saveMessage = async (data) => {
    try {
        const chat = await Chat.create({
            userId: data.userInfo.userId,
            userName: data.userInfo.userName,
            userAvatar: data.userInfo.avatar,
            message: data.msgContent,
            type: data.msgType || 'normal',
            likesIDs: [],
        });
        return chat;
    } catch (error) {
        console.error('Error saving chat:', error);
        throw error;
    }
};

/**
 * Get recent chat history
 */
exports.getRecentChats = async (limit = 50) => {
    try {
        return await Chat.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(); // sort desc first to get latest
    } catch (error) {
        console.error('Error getting chats:', error);
        throw error;
    }
};

/**
 * Like/Unlike a chat message
 */
exports.toggleLike = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return null;

        const index = chat.likesIDs.indexOf(userId);
        if (index === -1) {
            chat.likesIDs.push(userId);
        } else {
            chat.likesIDs.splice(index, 1);
        }

        await chat.save();
        return chat;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};
