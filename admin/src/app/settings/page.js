'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Save, Shield, Bell, Globe, Lock } from 'lucide-react';
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
        return <div className="text-center py-12">Loading settings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <Globe className="text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                            <input
                                type="email"
                                name="supportEmail"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Security & Access */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <Shield className="text-purple-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Security & Access</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                <p className="text-sm text-gray-500">Disable access for all users except admins</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-900">Allow Registrations</h3>
                                <p className="text-sm text-gray-500">Enable or disable new user signups</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="allowRegistrations"
                                    checked={settings.allowRegistrations}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Financial Limits */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <Lock className="text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Financial Limits</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Deposit (₹)</label>
                            <input
                                type="number"
                                name="minDeposit"
                                value={settings.minDeposit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Withdrawal (₹)</label>
                            <input
                                type="number"
                                name="maxWithdrawal"
                                value={settings.maxWithdrawal}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        <Save size={20} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
