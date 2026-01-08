const express = require('express');
const router = express.Router();
const chatService = require('../services/chat.service');

// Get all chat history
router.post('/get-all-chat', async (req, res) => {
    try {
        const chats = await chatService.getRecentChats();
        res.json({
            status: true,
            message: 'Chats retrieved',
            data: chats
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Like a chat message
router.post('/like-chat', async (req, res) => {
    try {
        const { chatID, userId } = req.body;
        if (!chatID || !userId) {
            return res.status(400).json({ status: false, message: 'Missing chatID or userId' });
        }

        // Toggle like
        await chatService.toggleLike(chatID, userId);

        res.json({
            status: true,
            message: 'Like updated'
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
