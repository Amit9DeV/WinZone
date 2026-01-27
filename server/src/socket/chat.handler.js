/**
 * Global Chat Handler
 * Handles real-time chat messages with rate limiting
 */

const chatHistory = []; // In-memory storage (last 50 messages)
const MAX_HISTORY = 50;
const RATE_LIMIT_MS = 2000; // 2 seconds between messages per user
const userLastMessage = new Map(); // userId -> timestamp

function initialize(io) {
    console.log('💬 Initializing Global Chat...');

    const chatNamespace = io.of('/chat');

    chatNamespace.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(`💬 User connected to chat: ${userId}`);

        // Send recent chat history
        socket.emit('chat:history', chatHistory);

        // Handle new messages
        socket.on('message:send', (data) => {
            try {
                const { message, username } = data;

                // Validation
                if (!message || !username) return;
                if (message.length > 200) {
                    socket.emit('error', 'Message too long (max 200 chars)');
                    return;
                }

                // Rate limiting
                const now = Date.now();
                const lastMsg = userLastMessage.get(userId);
                if (lastMsg && (now - lastMsg) < RATE_LIMIT_MS) {
                    socket.emit('error', 'Slow down! Wait 2 seconds between messages.');
                    return;
                }
                userLastMessage.set(userId, now);

                // Create message object
                const chatMessage = {
                    id: `${userId}-${now}`,
                    userId,
                    username,
                    message: message.trim(),
                    timestamp: now
                };

                // Store in history
                chatHistory.push(chatMessage);
                if (chatHistory.length > MAX_HISTORY) {
                    chatHistory.shift(); // Remove oldest
                }

                // Broadcast to all connected clients
                chatNamespace.emit('message:receive', chatMessage);

            } catch (error) {
                console.error('Chat error:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('disconnect', () => {
            console.log(`💬 User disconnected from chat: ${userId}`);
        });
    });

    console.log('✅ Global Chat initialized');
}

module.exports = { initialize };
