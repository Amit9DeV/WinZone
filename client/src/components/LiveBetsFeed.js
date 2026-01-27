'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function LiveBetsFeed() {
    const [bets, setBets] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

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
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-6 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-30"
            >
                <Trophy size={20} className="text-white" />
                {bets.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {Math.min(bets.length, 99)}
                    </div>
                )}
            </button>

            {/* Slide-out Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-full w-screen md:w-80 bg-surface-1 border-l border-white/10 z-[60] flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy size={20} className="text-white" />
                                    <h3 className="font-bold text-white">Live Bets</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Bets List */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {bets.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <Trophy size={48} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Waiting for bets...</p>
                                    </div>
                                ) : (
                                    bets.map((bet, i) => (
                                        <motion.div
                                            key={bet.id || i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-3 rounded-lg border ${bet.won
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-red-500/10 border-red-500/30'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {bet.won ? (
                                                        <TrendingUp size={16} className="text-green-500" />
                                                    ) : (
                                                        <TrendingDown size={16} className="text-red-500" />
                                                    )}
                                                    <span className="font-bold text-white text-sm">
                                                        {bet.username || 'Player'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">
                                                    {bet.game}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    Bet: ₹{bet.amount}
                                                </span>
                                                {bet.won && (
                                                    <span className="text-xs font-bold text-green-500">
                                                        +₹{bet.payout?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {bet.multiplier && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {bet.multiplier}x multiplier
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
