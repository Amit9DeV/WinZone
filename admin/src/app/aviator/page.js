'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Plane, Calendar, Clock, Trash2, Plus, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AviatorPage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        times: '',
        crashAt: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await adminAPI.getSchedules();
            if (response.data.success) {
                setSchedules(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const times = formData.times.split(',').map(t => t.trim());

        if (!formData.date || times.length === 0 || !formData.crashAt) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            const response = await adminAPI.createSchedule({
                date: formData.date,
                times,
                crashAt: parseFloat(formData.crashAt)
            });

            if (response.data.success) {
                toast.success('Schedule created');
                setFormData({ date: '', times: '', crashAt: '' });
                setShowForm(false);
                fetchSchedules();
            }
        } catch (error) {
            toast.error('Failed to create schedule');
        }
    };

    const deleteSchedule = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await adminAPI.deleteSchedule(id);
            toast.success('Schedule deleted');
            fetchSchedules();
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Plane className="text-[var(--danger)]" size={32} />
                        AVIATOR <span className="text-[var(--danger)]">CONTROL</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage flight schedules and crash points.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showForm
                        ? 'bg-[var(--surface-3)] text-white hover:bg-[var(--surface-2)]'
                        : 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 hover:shadow-[0_0_15px_var(--danger-glow)]'
                        }`}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    <span>{showForm ? 'Cancel' : 'New Schedule'}</span>
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel p-6 rounded-2xl mb-8 border border-[var(--danger)]/30">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <AlertTriangle className="text-[var(--danger)]" size={20} />
                                Create Flight Schedule
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Times (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="10:00, 11:30, 14:00"
                                        value={formData.times}
                                        onChange={(e) => setFormData({ ...formData, times: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Crash Multiplier</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="2.50"
                                        value={formData.crashAt}
                                        onChange={(e) => setFormData({ ...formData, crashAt: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[var(--danger)] text-white rounded-xl hover:bg-[var(--danger)]/90 hover:shadow-[0_0_20px_var(--danger-glow)] font-bold transition-all uppercase tracking-wider"
                                    >
                                        Save Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">Scanning flight logs...</div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--surface-1)] rounded-2xl border border-white/5">
                        <Plane className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-4 opacity-50" />
                        <h3 className="text-white font-bold text-lg">No active schedules</h3>
                        <p className="text-[var(--text-muted)]">No flights scheduled. Create one to start.</p>
                    </div>
                ) : (
                    schedules.map((schedule, index) => (
                        <motion.div
                            key={schedule._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel p-5 rounded-xl flex items-center justify-between group hover:border-[var(--danger)]/30 transition-all"
                        >
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-3 text-[var(--text-muted)]">
                                    <Calendar size={18} className="text-[var(--danger)]" />
                                    <span className="font-mono font-bold text-white">{schedule.date}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[var(--text-muted)]">
                                    <Clock size={18} className="text-[var(--danger)]" />
                                    <span className="font-mono font-bold text-white">{schedule.time}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">Crash At</span>
                                    <span className="font-black text-[var(--danger)] bg-[var(--danger)]/10 px-3 py-1 rounded-lg border border-[var(--danger)]/20 shadow-[0_0_10px_var(--danger-glow)]">
                                        {schedule.crashAt}x
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${schedule.used
                                    ? 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                                    : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                                    }`}>
                                    {schedule.used ? 'Completed' : 'Scheduled'}
                                </span>
                                {!schedule.used && (
                                    <button
                                        onClick={() => deleteSchedule(schedule._id)}
                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all"
                                        title="Delete Schedule"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
