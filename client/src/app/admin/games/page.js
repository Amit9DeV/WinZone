"use client";

import { useEffect, useState } from 'react';
import { Power, Settings, Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GameControl() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/games`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setGames(data.data);
            }
        } catch (error) {
            toast.error("Failed to load games");
        } finally {
            setLoading(false);
        }
    };

    const toggleGame = async (gameId, currentStatus) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/games/${gameId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ enabled: !currentStatus })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Game ${!currentStatus ? 'Enabled' : 'Disabled'}`);
                setGames(games.map(g => g.gameId === gameId ? { ...g, enabled: !currentStatus } : g));
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                    <div
                        key={game._id}
                        className={`bg-surface-1 border rounded-xl overflow-hidden transition-all ${game.enabled ? 'border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-red-500/30 opacity-75'
                            }`}
                    >
                        {/* Header */}
                        <div className={`p-4 flex items-center justify-between border-b ${game.enabled ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{game.icon || '🎮'}</span>
                                <div>
                                    <h3 className="font-bold text-white uppercase">{game.name}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${game.enabled ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                                        }`}>
                                        {game.enabled ? 'Live' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleGame(game.gameId, game.enabled)}
                                className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 ${game.enabled ? 'bg-red-500 text-white' : 'bg-green-500 text-black'
                                    }`}
                                title={game.enabled ? "Disable Game" : "Enable Game"}
                            >
                                <Power size={20} />
                            </button>
                        </div>

                        {/* Config (Read Only for now) */}
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Min Bet</span>
                                <span className="font-mono text-white">₹{game.minBet}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Max Bet</span>
                                <span className="font-mono text-white">₹{game.maxBet}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">House Edge</span>
                                <span className="font-mono text-white">{game.rtp ? (100 - game.rtp).toFixed(1) : '1.0'}%</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-white/5 border-t border-white/5 flex justify-end">
                            <button className="flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors">
                                <Settings size={14} />
                                Configure
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
