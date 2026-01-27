'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Trophy, Medal, TrendingUp, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'daily', label: 'Today', icon: Clock },
    { id: 'weekly', label: 'This Week', icon: Calendar },
    { id: 'monthly', label: 'This Month', icon: Trophy }
];

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState('daily');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/leaderboard/${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            } else {
                toast.error('Failed to load leaderboard');
            }
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            toast.error('Error loading leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (rank) => {
        switch (rank) {
            case 1: return 'text-yellow-500';
            case 2: return 'text-gray-400';
            case 3: return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy size={40} className="text-yellow-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Leaderboard</h1>
                    <p className="text-gray-400">Top winners across all games</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary text-black'
                                    : 'bg-surface-2 text-gray-400 hover:bg-surface-3'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Leaderboard Table */}
                {/* Leaderboard Content */}
                <div className="bg-surface-1 rounded-xl overflow-hidden border border-white/10">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading leaderboard...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-12 text-center">
                            <Trophy size={64} className="mx-auto text-gray-700 mb-4" />
                            <p className="text-gray-500">No data yet for this period</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-surface-2">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Player
                                            </th>
                                            <th className="px-4 md:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Profit
                                            </th>
                                            <th className="px-4 md:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Bets
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Win Rate
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {leaderboard.map((player, index) => {
                                            const rank = index + 1;
                                            return (
                                                <tr
                                                    key={player._id || index}
                                                    className="hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-4 md:px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {rank <= 3 ? (
                                                                <Medal size={24} className={getMedalColor(rank)} />
                                                            ) : (
                                                                <span className="text-gray-600 font-mono font-bold">
                                                                    #{rank}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black font-bold">
                                                                {player.username?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-white">
                                                                {player.username}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <TrendingUp size={16} className="text-green-500" />
                                                            <span className="font-bold text-green-500">
                                                                ₹{player.totalProfit?.toLocaleString() || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        <span className="text-gray-400 font-mono">
                                                            {player.totalBets || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-gray-400">
                                                            {player.winRate ? `${player.winRate.toFixed(1)}%` : '0%'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden">
                                {leaderboard.map((player, index) => {
                                    const rank = index + 1;
                                    return (
                                        <div
                                            key={player._id || index}
                                            className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4"
                                        >
                                            <div className="flex-shrink-0 w-8 flex justify-center">
                                                {rank <= 3 ? (
                                                    <Medal size={24} className={getMedalColor(rank)} />
                                                ) : (
                                                    <span className="text-gray-500 font-bold font-mono">#{rank}</span>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-[10px] sm:text-xs text-white">
                                                        {player.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-white text-sm sm:text-base">
                                                        {player.username}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-gray-400">
                                                    <span>{player.totalBets} Bets</span>
                                                    <span>{player.winRate?.toFixed(0)}% Win Rate</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-green-500 text-sm sm:text-base">
                                                    ₹{player.totalProfit?.toLocaleString()}
                                                </div>
                                                <span className="text-[10px] text-gray-500 uppercase">Profit</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-gray-300 text-center">
                        🏆 Leaderboard updates every 5 minutes. Keep playing to climb the ranks!
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
