'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from './UserAvatar';
import EmojiPicker from './EmojiPicker';

export default function ChatSidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
            : 'https://winzone-final.onrender.com';

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
            // alert(msg); // Removed alert for better UX
            console.error(msg);
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
            username: user.name,
            // Mock data - In real app, this comes from DB
            level: Math.floor(Math.random() * 50) + 1,
            avatar: user?.avatar
        });
        setInput('');
        setTimeout(() => setSending(false), 2000); // Rate limit UI
    };

    const handleEmojiSelect = (emoji) => {
        setInput(prev => prev + emoji);
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
                        className="fixed right-0 top-0 h-full w-screen md:w-80 bg-surface-1 border-l border-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-2">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <MessageCircle size={20} className="text-primary" />
                                <span>Global Chat</span>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex gap-3 animate-fade-in">
                                    <div className="flex-shrink-0 mt-1">
                                        <UserAvatar
                                            user={{ name: msg.username, avatar: msg.avatar }}
                                            size="sm"
                                            level={msg.level || 1}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-300">{msg.username}</span>
                                            <span className="text-[10px] bg-surface-3 px-1.5 rounded text-text-muted border border-white/5">
                                                Lvl {msg.level || 1}
                                            </span>
                                            <span className="text-[10px] text-gray-600 ml-auto">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-sm text-white mt-1 break-words bg-surface-2 p-2 rounded-tr-lg rounded-b-lg border border-white/5">
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 bg-surface-2">
                            <div className="flex gap-2 items-center bg-surface-3 border border-white/10 rounded-lg pr-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    maxLength={200}
                                    className="flex-1 bg-transparent px-3 py-3 text-white text-sm focus:outline-none"
                                    disabled={sending}
                                />
                                <EmojiPicker onSelect={handleEmojiSelect} />
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={sending || !input.trim()}
                                className="w-full mt-2 py-2 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
