'use client';

import { useState, useEffect } from 'react';
import { gameAPI, adminAPI } from '@/lib/api';
import { Gamepad2, Power, Settings, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="space-y-8 p-4 md:p-8">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Gamepad2 className="text-[var(--primary)]" size={32} />
                GAME <span className="text-[var(--primary)]">MANAGEMENT</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-20 text-[var(--text-muted)] animate-pulse">Loading games...</div>
                ) : games.map((game, index) => (
                    <motion.div
                        key={game.gameId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel rounded-2xl overflow-hidden group hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-shadow duration-300"
                    >
                        <div className="h-40 bg-[var(--surface-3)] relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10" />
                            <Gamepad2 size={64} className="text-white/10 group-hover:text-white/30 transition-all duration-500 scale-110 group-hover:scale-125 group-hover:rotate-12" />

                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${game.enabled
                                ? 'bg-[var(--success)] text-black shadow-[0_0_10px_var(--success-glow)]'
                                : 'bg-[var(--danger)] text-white shadow-[0_0_10px_var(--danger-glow)]'
                                }`}>
                                {game.enabled ? 'Active' : 'Disabled'}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                                    <p className="text-xs font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded w-fit">ID: {game.gameId}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => toggleGame(game.gameId, !game.enabled)}
                                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide transition-all ${game.enabled
                                        ? 'bg-[var(--surface-2)] text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)] hover:text-white hover:shadow-[0_0_15px_var(--danger-glow)]'
                                        : 'bg-[var(--surface-2)] text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)] hover:text-black hover:shadow-[0_0_15px_var(--success-glow)]'
                                        }`}
                                >
                                    <Power size={18} strokeWidth={3} />
                                    {game.enabled ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    onClick={() => openSettings(game)}
                                    className="p-3 bg-[var(--surface-2)] text-white border border-white/10 rounded-xl hover:bg-[var(--primary)] hover:text-black hover:border-[var(--primary)] hover:shadow-[0_0_15px_var(--primary-glow)] transition-all"
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
            <AnimatePresence>
                {showSettingsModal && selectedGame && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[var(--surface-2)]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings size={20} className="text-[var(--primary)]" />
                                    Settings: <span className="text-[var(--primary)]">{selectedGame.name}</span>
                                </h3>
                                <button onClick={() => setShowSettingsModal(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSettingsSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Min Bet (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={settingsForm.minBet}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, minBet: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Max Bet (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={settingsForm.maxBet}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, maxBet: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
                                        Advanced Config (JSON Metadata)
                                        <span className="text-xs text-[var(--primary)] font-normal ml-2 opacity-70">multiplier, odds, etc.</span>
                                    </label>
                                    <textarea
                                        rows="5"
                                        value={settingsForm.metadata}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, metadata: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono text-sm"
                                        placeholder='{"odds": 2.0, "special": true}'
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettingsModal(false)}
                                        className="px-6 py-2.5 text-[var(--text-muted)] hover:text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[var(--primary)] text-black rounded-xl hover:bg-[var(--primary)]/90 hover:shadow-[0_0_15px_var(--primary-glow)] font-bold transition-all flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
