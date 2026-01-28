'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gamepad2, Users, X } from 'lucide-react'; // Changed icons
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function LiveBetsFeed() {
    const [bets, setBets] = useState([]);
    const [isOpen, setIsOpen] = useState(false); // Default closed on mobile

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';

        // Fetch history
        fetch(`${API_URL}/games/recent-bets`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBets(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch bets:', err));

        const socket = io(SOCKET_URL);

        socket.on('bet:live', (bet) => {
            setBets(prev => [bet, ...prev].slice(0, 50)); // Keep last 50 bets
        });

        return () => socket.disconnect();
    }, []);

    return (
        <>
            {/* Desktop: Always visible sidebar widget or integration? 
                For now, keeping the floating toggle for mobile/desktop consistency 
                but giving it a cleaner look. 
            */}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-4 z-40 bg-surface-2 hover:bg-surface-3 text-white p-3 rounded-full shadow-xl border border-white/10 transition-all hover:scale-105 group"
            >
                <div className="relative">
                    <Trophy size={24} className="group-hover:text-primary transition-colors" />
                    {bets.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {Math.min(bets.length, 99)}
                        </span>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-surface-1 border-l border-white/10 z-50 flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-2">
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h3>Live Bets</h3>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-white/5 bg-surface-2/50">
                                <div>Game</div>
                                <div>User</div>
                                <div className="text-right">Bet</div>
                                <div className="text-right">Payout</div>
                            </div>

                            {/* Rows */}
                            <div className="flex-1 overflow-y-auto">
                                {bets.map((bet, i) => (
                                    <div
                                        key={bet.id || i}
                                        className={`grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 text-sm items-center hover:bg-white/5 transition-colors ${bet.won ? 'bg-green-500/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Gamepad2 size={14} />
                                            <span className="truncate max-w-[60px]">{bet.game}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-white font-medium">
                                            <Users size={12} className="text-gray-500" />
                                            <span className="truncate max-w-[80px]">{bet.username}</span>
                                        </div>
                                        <div className="text-right text-gray-300">
                                            ₹{bet.amount}
                                        </div>
                                        <div className={`text-right font-bold ${bet.won ? 'text-green-400' : 'text-gray-500'}`}>
                                            {bet.won ? `+₹${bet.payout?.toFixed(0)}` : '0.00'}
                                            {bet.won && bet.multiplier && (
                                                <div className="text-[10px] text-green-500/70">{bet.multiplier}x</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
