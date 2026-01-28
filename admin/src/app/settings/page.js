'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Save, Shield, Globe, Lock, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: '',
        supportEmail: '',
        maintenanceMode: false,
        allowRegistrations: true,
        minDeposit: 0,
        maxWithdrawal: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminAPI.getSettings();
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await adminAPI.updateSettings(settings);
            if (response.data.success) {
                toast.success('Settings saved successfully');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">Loading system configuration...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Settings className="text-[var(--primary)]" size={32} />
                SYSTEM <span className="text-[var(--primary)]">SETTINGS</span>
            </h1>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--secondary)]"></div>
                    <div className="flex items-center space-x-3 mb-8">
                        <Globe className="text-[var(--secondary)]" size={24} />
                        <h2 className="text-xl font-bold text-white">General Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] focus:outline-none text-white placeholder-gray-600 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Support Email</label>
                            <input
                                type="email"
                                name="supportEmail"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] focus:outline-none text-white placeholder-gray-600 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Security & Access */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--danger)]"></div>
                    <div className="flex items-center space-x-3 mb-8">
                        <Shield className="text-[var(--danger)]" size={24} />
                        <h2 className="text-xl font-bold text-white">Security & Access</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-5 bg-[var(--surface-2)] rounded-xl border border-white/5 hover:border-[var(--danger)]/30 transition-all">
                            <div>
                                <h3 className="font-bold text-white">Maintenance Mode</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Restrict access to admins only</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-7 bg-[var(--surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--danger)] after:shadow-md"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-[var(--surface-2)] rounded-xl border border-white/5 hover:border-[var(--success)]/30 transition-all">
                            <div>
                                <h3 className="font-bold text-white">Allow Registrations</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Enable new user signups</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="allowRegistrations"
                                    checked={settings.allowRegistrations}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-7 bg-[var(--surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--success)] after:shadow-md"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Financial Limits */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--success)]"></div>
                    <div className="flex items-center space-x-3 mb-8">
                        <Lock className="text-[var(--success)]" size={24} />
                        <h2 className="text-xl font-bold text-white">Financial Limits</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Min Deposit (₹)</label>
                            <input
                                type="number"
                                name="minDeposit"
                                value={settings.minDeposit}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--success)] focus:ring-1 focus:ring-[var(--success)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Max Withdrawal (₹)</label>
                            <input
                                type="number"
                                name="maxWithdrawal"
                                value={settings.maxWithdrawal}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--success)] focus:ring-1 focus:ring-[var(--success)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        className="flex items-center space-x-2 px-8 py-3 bg-[var(--primary)] text-black rounded-xl hover:bg-[var(--primary)]/90 hover:shadow-[0_0_20px_var(--primary-glow)] font-bold transition-all shadow-lg transform active:scale-95"
                    >
                        <Save size={20} className="stroke-[3px]" />
                        <span>SAVE CONFIGURATION</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
