'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, Save, Power, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BotSettings() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        enabled: false,
        games: {}
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getSettings();
            if (response.data.success) {
                setSettings(response.data.data.botConfig || { enabled: false, games: {} });
            }
        } catch (error) {
            toast.error('Failed to load bot settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await adminAPI.updateSettings({ botConfig: settings });
            if (response.data.success) {
                toast.success('Bot settings updated');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const toggleMain = () => {
        setSettings({ ...settings, enabled: !settings.enabled });
    };

    const toggleGame = (gameId) => {
        const game = settings.games[gameId] || { enabled: false, minBet: 10, maxBet: 100 };
        setSettings({
            ...settings,
            games: {
                ...settings.games,
                [gameId]: { ...game, enabled: !game.enabled }
            }
        });
    };

    const updateGame = (gameId, field, value) => {
        const game = settings.games[gameId] || { enabled: false, minBet: 10, maxBet: 100 };
        setSettings({
            ...settings,
            games: {
                ...settings.games,
                [gameId]: { ...game, [field]: Number(value) }
            }
        });
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading Bot Config...</div>;

    const gamesList = ['aviator', 'mines', 'dice', 'plinko', 'limbo', 'coinflip', 'wheel'];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bot className="text-purple-500" /> Bot Management
                    </h1>
                    <p className="text-gray-400 text-sm">Configure fake activity bots to boost engagement.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Save size={18} /> Save Config
                </button>
            </div>

            {/* Master Switch */}
            <div className={`p-6 rounded-xl border ${settings.enabled ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} flex justify-between items-center`}>
                <div>
                    <h3 className="text-lg font-bold text-white">Master Bot Switch</h3>
                    <p className="text-sm text-gray-400">
                        {settings.enabled ? 'Bots are ACTIVE and placing bets.' : 'All bots are currently PAUSED.'}
                    </p>
                </div>
                <button
                    onClick={toggleMain}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${settings.enabled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                >
                    <Power size={20} />
                    {settings.enabled ? 'Enabled' : 'Disabled'}
                </button>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gamesList.map((gameId) => {
                    const config = settings.games[gameId] || { enabled: false, minBet: 10, maxBet: 100 };

                    return (
                        <motion.div
                            key={gameId}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`bg-gray-800 rounded-xl p-6 border ${config.enabled ? 'border-purple-500/40' : 'border-gray-700'} relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white capitalize">{gameId}</h3>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${config.enabled ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {config.enabled ? 'ACTIVE' : 'OFF'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Min Bet (₹)</label>
                                    <input
                                        type="number"
                                        value={config.minBet}
                                        onChange={(e) => updateGame(gameId, 'minBet', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Max Bet (₹)</label>
                                    <input
                                        type="number"
                                        value={config.maxBet}
                                        onChange={(e) => updateGame(gameId, 'maxBet', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => toggleGame(gameId)}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${config.enabled
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                    }`}
                            >
                                {config.enabled ? 'Deactivate' : 'Activate'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
