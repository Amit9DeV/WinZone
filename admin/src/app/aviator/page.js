'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Plane, Calendar, Clock, Trash2, Plus, AlertTriangle } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Aviator Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? <AlertTriangle size={20} /> : <Plus size={20} />}
                    <span>{showForm ? 'Cancel' : 'New Schedule'}</span>
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Create Flight Schedule</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Times (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="10:00, 11:30, 14:00"
                                        value={formData.times}
                                        onChange={(e) => setFormData({ ...formData, times: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Crash Multiplier</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="2.50"
                                        value={formData.crashAt}
                                        onChange={(e) => setFormData({ ...formData, crashAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                    <div className="text-center py-12 text-gray-500">Loading schedules...</div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                        <Plane className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No active schedules</p>
                    </div>
                ) : (
                    schedules.map((schedule, index) => (
                        <motion.div
                            key={schedule._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Calendar size={18} />
                                    <span className="font-medium">{schedule.date}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Clock size={18} />
                                    <span className="font-medium">{schedule.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Crash at:</span>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {schedule.crashAt}x
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.used
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                    {schedule.used ? 'Completed' : 'Scheduled'}
                                </span>
                                {!schedule.used && (
                                    <button
                                        onClick={() => deleteSchedule(schedule._id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
