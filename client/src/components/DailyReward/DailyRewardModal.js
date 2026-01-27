'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const REWARD_SCHEDULE = [10, 15, 20, 30, 50, 75, 100];

export default function DailyRewardModal() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [rewardData, setRewardData] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        if (user) {
            checkRewardStatus();
        }
    }, [user]);

    const checkRewardStatus = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const response = await fetch(`${API_URL}/rewards/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success && data.data.canClaim) {
                setRewardData(data.data);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Failed to check reward status:', error);
        }
    };

    const claimReward = async () => {
        setClaiming(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const response = await fetch(`${API_URL}/rewards/claim`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setClaimed(true);

                // Confetti celebration
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF6B6B']
                });

                // Close after 2 seconds
                setTimeout(() => {
                    setIsOpen(false);
                    setClaimed(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to claim reward:', error);
        } finally {
            setClaiming(false);
        }
    };

    if (!rewardData) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => !claiming && setIsOpen(false)}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-surface-1 to-surface-2 rounded-3xl p-4 md:p-6 max-w-[90vw] md:max-w-md w-full border border-primary/20 shadow-2xl relative overflow-hidden"
                        >
                            {/* Background glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                            {/* Close button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                                disabled={claiming}
                            >
                                <X size={20} />
                            </button>

                            {/* Content */}
                            <div className="relative z-10 text-center">
                                {/* Icon */}
                                <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Gift size={40} className="text-primary" />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {claimed ? 'Claimed!' : 'Daily Reward'}
                                </h2>

                                {/* Streak */}
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <Flame size={16} className="text-orange-500" />
                                    <span className="text-gray-400 text-sm">
                                        {rewardData.currentStreak} Day Streak
                                    </span>
                                </div>

                                {/* Reward Amount */}
                                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                                    <div className="text-5xl font-black text-primary mb-2">
                                        ₹{rewardData.rewardAmount}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        Day {rewardData.nextRewardDay} Reward
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        {REWARD_SCHEDULE.map((amount, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex flex-col items-center ${idx < rewardData.currentStreak ? 'opacity-100' : 'opacity-30'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx < rewardData.currentStreak
                                                    ? 'bg-primary text-black'
                                                    : 'bg-surface-3 text-gray-500'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1">₹{amount}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Claim button */}
                                {!claimed && (
                                    <button
                                        onClick={claimReward}
                                        disabled={claiming}
                                        className="w-full bg-gradient-to-r from-primary to-primary-hover text-black font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                                    >
                                        {claiming ? 'Claiming...' : 'Claim Reward'}
                                    </button>
                                )}

                                {claimed && (
                                    <div className="text-green-400 font-bold">
                                        ✅ Reward Added to Balance!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
