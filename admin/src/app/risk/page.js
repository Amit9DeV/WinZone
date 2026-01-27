'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { ShieldAlert, Users, TrendingUp, AlertTriangle, Eye, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RiskManagement() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ whales: [], alerts: [] });

    useEffect(() => {
        fetchRiskData();
    }, []);

    const fetchRiskData = async () => {
        try {
            const response = await adminAPI.getRiskDashboard();
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load risk data');
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId) => {
        if (!confirm('Are you sure you want to ban this user?')) return;
        try {
            await adminAPI.updateUserStatus(userId, true);
            toast.success('User banned successfully');
            fetchRiskData();
        } catch (error) {
            toast.error('Failed to ban user');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Scanning for threats...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> Risk Management
                    </h1>
                    <p className="text-gray-400 text-sm">Monitor high-rollers and suspicious activity.</p>
                </div>
                <button
                    onClick={fetchRiskData}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                    Refresh Scan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Alerts Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex gap-2 items-center">
                        <AlertTriangle className="text-orange-500" size={20} />
                        Live Risk Alerts
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {data.alerts.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No active threats detected.</div>
                        ) : (
                            data.alerts.map((alert, i) => (
                                <div key={i} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {alert.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-white font-medium">{alert.name} <span className="text-gray-400 text-sm">({alert.userId})</span></p>
                                        <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                                    </div>
                                    <button
                                        onClick={() => handleBan(alert.userId)}
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Ban User"
                                    >
                                        <Ban size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Whales Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex gap-2 items-center">
                        <Users className="text-blue-500" size={20} />
                        Top Whales (High Rollers)
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
                                    <th className="py-3 px-2">User</th>
                                    <th className="py-3 px-2 text-right">Balance</th>
                                    <th className="py-3 px-2 text-right">Wagered</th>
                                    <th className="py-3 px-2 text-right">Win Rate</th>
                                    <th className="py-3 px-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.whales.map((whale, i) => (
                                    <tr key={whale._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                        <td className="py-3 px-2">
                                            <div className="font-medium text-white">{whale.name}</div>
                                            <div className="text-xs text-gray-500">{whale.email}</div>
                                        </td>
                                        <td className="py-3 px-2 text-right font-bold text-green-400">₹{whale.balance.toLocaleString()}</td>
                                        <td className="py-3 px-2 text-right text-gray-300">₹{whale.totalWagered.toLocaleString()}</td>
                                        <td className="py-3 px-2 text-right">
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${parseFloat(whale.winRate) > 60 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                                                }`}>
                                                {whale.winRate}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <button
                                                onClick={() => handleBan(whale._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Ban size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
