'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Ticket, Plus, Trash2, Calendar, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromosPage() {
    const [loading, setLoading] = useState(true);
    const [promos, setPromos] = useState([]);

    // Create Form
    const [formData, setFormData] = useState({
        code: '',
        value: 100, // Default 100 Rs
        type: 'fixed',
        maxUses: 100,
        expiresInDays: 7
    });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            const response = await adminAPI.getPromos();
            if (response.data.success) setPromos(response.data.data);
        } catch (error) {
            toast.error('Failed to load promos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Calculate expiry date
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Number(formData.expiresInDays));

            await adminAPI.createPromo({
                ...formData,
                expiresAt
            });

            toast.success('Promo code created!');
            setFormData({ code: '', value: 100, type: 'fixed', maxUses: 100, expiresInDays: 7 });
            fetchPromos();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Create failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this promo code?')) return;
        try {
            await adminAPI.deletePromo(id);
            toast.success('Deleted');
            setPromos(promos.filter(p => p._id !== id));
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied: ${code}`);
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading Promos...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Ticket className="text-green-500" /> Promo Codes
                    </h1>
                    <p className="text-gray-400 text-sm">Generate referral codes and bonuses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Form (1/3) */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Create New Code</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Code (e.g. WELCOME100)</label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm font-mono uppercase"
                                placeholder="WELCOME500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Value (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Max Uses</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Expires In (Days)</label>
                            <input
                                type="number"
                                required
                                value={formData.expiresInDays}
                                onChange={(e) => setFormData({ ...formData, expiresInDays: Number(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={18} /> Create Code
                        </button>
                    </form>
                </div>

                {/* Promo List (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    {promos.length === 0 ? (
                        <div className="text-center text-gray-500 py-12 bg-gray-900 border border-gray-800 rounded-xl">No active promo codes</div>
                    ) : (
                        promos.map((promo) => {
                            const isExpired = new Date() > new Date(promo.expiresAt);
                            const isFull = promo.usedCount >= promo.maxUses;

                            return (
                                <div key={promo._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center group hover:border-gray-700 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className={`p-3 rounded-lg ${isExpired || isFull ? 'bg-gray-800 text-gray-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4
                                                    onClick={() => copyCode(promo.code)}
                                                    className="text-lg font-bold text-white font-mono cursor-pointer hover:text-green-400 flex items-center gap-2"
                                                >
                                                    {promo.code} <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </h4>
                                                {(isExpired || isFull) && (
                                                    <span className="bg-red-500/10 text-red-500 text-[10px] px-2 rounded font-bold uppercase">
                                                        {isExpired ? 'Expired' : 'Max Limit'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Value: <span className="text-white">₹{promo.value}</span> •
                                                Uses: <span className="text-white">{promo.usedCount}/{promo.maxUses}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Calendar size={10} /> Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(promo._id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
