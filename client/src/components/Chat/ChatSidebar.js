'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatSidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = 'https://winzone-final.onrender.com';

        const chatSocket = io(`${SOCKET_URL}/chat`, {
            query: { userId: user._id || user.id },
            transports: ['websocket', 'polling']
        });

        chatSocket.on('connect', () => {
            console.log('💬 Connected to chat');
        });

        chatSocket.on('chat:history', (history) => {
            setMessages(history);
        });

        chatSocket.on('message:receive', (message) => {
            setMessages(prev => [...prev, message]);
        });

        chatSocket.on('error', (msg) => {
            alert(msg);
        });

        setSocket(chatSocket);

        return () => chatSocket.disconnect();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || sending || !socket) return;

        setSending(true);
        socket.emit('message:send', {
            message: input.trim(),
            username: user.name
        });
        setInput('');
        setTimeout(() => setSending(false), 2000); // Rate limit UI
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Mobile Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />

                    {/* Chat Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed right-0 top-0 h-full w-screen md:w-96 bg-surface-1 border-l border-white/10 z-50 flex flex-col shadow-2xl\"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-2\">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <MessageCircle size={20} />
                                <span>Global Chat</span>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div >

                        {/* Messages */}
                        < div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {
                                messages.map((msg) => (
                                    <div key={msg.id} className="bg-surface-2 rounded-lg p-3">
                                        < div className="text-xs text-gray-400 font-bold">{msg.username}</div>
                                        < div className="text-sm text-white mt-1">{msg.message}</div>
                                    </div >
                                ))
                            }
                            <div ref={messagesEndRef} />
                        </div >

                        {/* Input */}
                        < div className="p-4 border-t border-white/10 bg-surface-2">
                            < div className="flex gap-2">
                                < input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)
                                    }
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    maxLength={200}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    disabled={sending}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={sending || !input.trim()}
                                    className="px-4 bg-primary text-black rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={16} />
                                </button >
                            </div >
                            <div className="text-xs text-gray-500 mt-2">
                                Max 200 chars • 2s cooldown
                            </div >
                        </div >
                    </motion.div >
                </>
            )}
        </AnimatePresence >
    );
}
