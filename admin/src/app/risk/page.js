'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { ShieldAlert, AlertTriangle, User, Ban, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RiskPage() {
    const [riskUsers, setRiskUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRiskUsers();
    }, []);

    const fetchRiskUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getHighRiskUsers();
            if (response.data.success) {
                setRiskUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load risk data');
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId) => {
        if (!confirm("Are you sure you want to ban this user?")) return;
        try {
            await adminAPI.toggleUserBan(userId, true);
            toast.success("User banned successfully");
            fetchRiskUsers();
        } catch (err) {
            toast.error("Failed to ban user");
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-[var(--danger)]" size={32} />
                        RISK <span className="text-[var(--danger)]">MANAGEMENT</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">Real-time fraud detection and anomaly monitoring.</p>
                </div>
                <button
                    onClick={fetchRiskUsers}
                    className="p-2 bg-[var(--surface-2)] text-[var(--primary)] rounded-lg hover:bg-[var(--surface-3)] transition-all"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Risk Factors Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-xl border-l-4 border-[var(--danger)]">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="text-[var(--danger)]" size={24} />
                        <h3 className="font-bold text-white">Bot Behavior</h3>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Flags users placing {'>'}10 bets per second.</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-l-4 border-[var(--warning)]">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="text-[var(--warning)]" size={24} />
                        <h3 className="font-bold text-white">Multi-Account</h3>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Flags multiple accounts sharing the same IP address.</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border-l-4 border-[var(--secondary)]">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="text-[var(--secondary)]" size={24} />
                        <h3 className="font-bold text-white">Win Rate Anomaly</h3>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Flags users with {'>'}90% win rate over 50 games.</p>
                </div>
            </div>

            {/* High Risk Users Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[var(--surface-2)] flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">High Priority Alerts</h3>
                    <span className="bg-[var(--danger)]/20 text-[var(--danger)] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        {riskUsers.length} Active Threats
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--surface-1)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Risk Score</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Flags</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)]">Scanning for anomalies...</td>
                                </tr>
                            ) : riskUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <ShieldAlert size={48} className="text-[var(--success)]" />
                                            <span className="text-[var(--text-muted)] font-medium">System Secure. No threats detected.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                riskUsers.map((user, i) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-[var(--surface-3)] flex items-center justify-center font-bold text-white">
                                                    {user.name[0]}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                                    <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 bg-[var(--surface-3)] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${user.riskProfile.riskScore > 80 ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'}`}
                                                        style={{ width: `${user.riskProfile.riskScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-bold ${user.riskProfile.riskScore > 80 ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
                                                    {user.riskProfile.riskScore}/100
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.riskProfile.flags.map((flag, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20">
                                                        {flag.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[var(--text-muted)]">
                                            {user.riskProfile.lastPlayedIp || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleBan(user._id)}
                                                disabled={user.isBanned}
                                                className="px-3 py-1.5 bg-[var(--danger)]/10 hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ml-auto"
                                            >
                                                <Ban size={14} />
                                                {user.isBanned ? 'BANNED' : 'BAN USER'}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
