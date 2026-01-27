'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';

const HELP_MESSAGES = [
    {
        category: "Getting Started",
        questions: [
            { q: "How do I deposit money?", a: "Click on your balance at the top, then click 'Deposit'. You can add funds via UPI, cards, or wallets." },
            { q: "How do I withdraw?", a: "Go to Wallet page, click 'Withdraw', enter amount and your payment details. Minimum withdrawal is ₹100." },
            { q: "Is it safe to play?", a: "Yes! All games are provably fair. You can verify each result. We use secure payment methods." }
        ]
    },
    {
        category: "Games",
        questions: [
            { q: "Which game is easiest?", a: "Dice and Coin Flip are simplest. Mines and Plinko offer more strategy. Try all with small bets!" },
            { q: "How do I win?", a: "Each game has different odds. Check the 'How to Play' button on each game for rules and strategies." },
            { q: "What's the minimum bet?", a: "Most games start at ₹10. You can adjust bet amounts before playing." }
        ]
    },
    {
        category: "Account",
        questions: [
            { q: "How do I claim daily rewards?", a: "Login daily! A popup will show your reward. Streak rewards increase up to ₹100 on day 7." },
            { q: "I forgot my password", a: "Click 'Login' → 'Forgot Password'. Enter your email to reset it." },
            { q: "Can I change my username?", a: "Go to Profile page and click 'Edit Profile' to update your name and avatar." }
        ]
    }
];

export default function HelpChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "👋 Hi! I'm here to help! Pick a question below or ask me anything." }
    ]);
    const [input, setInput] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    const handleQuickQuestion = (question, answer) => {
        setMessages(prev => [
            ...prev,
            { type: 'user', text: question },
            { type: 'bot', text: answer }
        ]);
        setExpandedCategory(null);
    };

    const resetChat = () => {
        setMessages([
            { type: 'bot', text: "👋 Hi! I'm here to help! Pick a question below or ask me anything." }
        ]);
        setExpandedCategory(null);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [
            ...prev,
            { type: 'user', text: input },
            { type: 'bot', text: "Thanks for your question! For detailed help, please contact support or check our FAQ page." }
        ]);
        setInput('');
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
                    >
                        <MessageCircle size={24} className="text-black" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 h-[60vh] md:h-[500px] bg-surface-1 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-primary-hover p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={16} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black text-sm">Help Assistant</h3>
                                    <p className="text-xs text-black/70">Online now</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-black/70 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.type === 'user'
                                            ? 'bg-primary text-black'
                                            : 'bg-surface-2 text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Back to Menu Button */}
                            {messages.length > 1 && (
                                <div className="mt-4">
                                    <button
                                        onClick={resetChat}
                                        className="w-full px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10"
                                    >
                                        <ChevronDown size={16} className="rotate-90" />
                                        <span className="text-sm font-medium">Back to Menu</span>
                                    </button>
                                </div>
                            )}

                            {/* Quick Questions */}
                            {messages.length === 1 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Quick Help</p>
                                    {HELP_MESSAGES.map((category, idx) => (
                                        <div key={idx} className="bg-surface-2 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                                                className="w-full p-3 flex items-center justify-between hover:bg-surface-3 transition-colors"
                                            >
                                                <span className="text-sm font-bold text-white">{category.category}</span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform ${expandedCategory === idx ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>
                                            <AnimatePresence>
                                                {expandedCategory === idx && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-2 space-y-1">
                                                            {category.questions.map((item, qIdx) => (
                                                                <button
                                                                    key={qIdx}
                                                                    onClick={() => handleQuickQuestion(item.q, item.a)}
                                                                    className="w-full text-left p-2 rounded hover:bg-black/20 transition-colors"
                                                                >
                                                                    <p className="text-xs text-primary">❓ {item.q}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 bg-surface-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="px-4 bg-primary text-black rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">
                                For complex issues, contact support
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
