'use client';

import { useState, useEffect } from 'react';
import { gameAPI, adminAPI } from '@/lib/api';
import { Gamepad2, Power, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function GamesPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);



    const [selectedGame, setSelectedGame] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        minBet: 0,
        maxBet: 0,
        metadata: {}
    });

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const response = await adminAPI.getGames();
            if (response.data.success) {
                setGames(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const toggleGame = async (gameId, enabled) => {
        try {
            const response = await adminAPI.toggleGame(gameId, enabled);
            if (response.data.success) {
                toast.success(`Game ${enabled ? 'enabled' : 'disabled'}`);
                fetchGames();
            }
        } catch (error) {
            toast.error('Failed to update game status');
        }
    };

    const openSettings = (game) => {
        setSelectedGame(game);
        setSettingsForm({
            minBet: game.minBet,
            maxBet: game.maxBet,
            metadata: JSON.stringify(game.metadata || {}, null, 2)
        });
        setShowSettingsModal(true);
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                minBet: parseFloat(settingsForm.minBet),
                maxBet: parseFloat(settingsForm.maxBet),
            };

            // Try parsing metadata if provided
            if (settingsForm.metadata) {
                try {
                    payload.metadata = JSON.parse(settingsForm.metadata);
                } catch (err) {
                    return toast.error('Invalid JSON in Metadata field');
                }
            }

            const response = await adminAPI.updateGameConfig(selectedGame.gameId, payload);
            if (response.data.success) {
                toast.success('Game settings updated');
                setShowSettingsModal(false);
                fetchGames();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Games Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-12 text-gray-500">Loading games...</div>
                ) : games.map((game, index) => (
                    <motion.div
                        key={game.gameId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                    >
                        <div className="h-32 bg-gray-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                            <Gamepad2 size={48} className="text-white/20 group-hover:text-white/40 transition-colors" />
                            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${game.enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {game.enabled ? 'Active' : 'Disabled'}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{game.name}</h3>
                                    <p className="text-sm text-gray-500">ID: {game.gameId}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => toggleGame(game.gameId, !game.enabled)}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${game.enabled
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    <Power size={16} />
                                    {game.enabled ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    onClick={() => openSettings(game)}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                                    title="Game Settings"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Settings Modal */}
            {showSettingsModal && selectedGame && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Settings: {selectedGame.name}</h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white text-2xl">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Min Bet (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={settingsForm.minBet}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, minBet: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Bet (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={settingsForm.maxBet}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, maxBet: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Advanced Config (JSON Metadata)
                                    <span className="text-xs text-gray-500 font-normal ml-2">multiplier, odds, etc.</span>
                                </label>
                                <textarea
                                    rows="5"
                                    value={settingsForm.metadata}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, metadata: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-white placeholder-gray-400"
                                    placeholder='{"odds": 2.0, "special": true}'
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
