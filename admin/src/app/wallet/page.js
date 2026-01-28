'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Check, X, Clock, DollarSign, ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'requests') {
                const response = await adminAPI.getWalletRequests();
                if (response.data.success) {
                    setRequests(response.data.data);
                }
            } else {
                const response = await adminAPI.getWalletHistory();
                if (response.data.success) {
                    setHistory(response.data.data);
                }
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            const apiCall = action === 'approve' ? adminAPI.approveRequest : adminAPI.rejectRequest;
            const response = await apiCall(requestId, action === 'approve' ? 'Approved' : 'Rejected');

            if (response.data.success) {
                toast.success(`Request ${action}d successfully`);
                fetchData();
            }
        } catch (error) {
            toast.error(`Failed to ${action} request`);
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <WalletIcon className="text-[var(--primary)]" size={32} />
                        WALLET <span className="text-[var(--primary)]">CONTROL</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage deposits, withdrawals, and transaction history.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[var(--surface-2)] rounded-xl border border-white/5 w-fit">
                {['requests', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab
                            ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_var(--primary-glow)]'
                            : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-[var(--text-muted)] animate-pulse">Scanning blockchain...</p>
                        </div>
                    ) : activeTab === 'requests' ? (
                        requests.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--surface-1)] rounded-2xl border border-white/5 mx-auto max-w-lg">
                                <div className="mx-auto w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <DollarSign className="text-gray-500" size={32} />
                                </div>
                                <h3 className="text-white font-bold text-lg">No Pending Requests</h3>
                                <p className="text-[var(--text-muted)]">All caught up! Check back later.</p>
                            </div>
                        ) : (
                            requests.map((request, index) => (
                                <motion.div
                                    key={request._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
                                >
                                    <div className={`absolute left-0 top-0 w-1 h-full ${request.type === 'DEPOSIT' ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`}></div>

                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${request.type === 'DEPOSIT'
                                            ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 shadow-[0_0_15px_var(--success-glow)]'
                                            : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 shadow-[0_0_15px_var(--danger-glow)]'
                                            }`}>
                                            {request.type === 'DEPOSIT' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{request.userId?.name || 'Unknown User'}</h3>
                                            <p className="text-sm text-[var(--text-muted)]">{request.userId?.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <div className="flex items-center text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-1 rounded border border-white/5">
                                                    <Clock size={12} className="mr-1" />
                                                    {new Date(request.createdAt).toLocaleString()}
                                                </div>
                                                {request.type === 'DEPOSIT' && request.utr && (
                                                    <div className="text-xs font-mono text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded border border-[var(--success)]/20 select-all">
                                                        UTR: {request.utr}
                                                    </div>
                                                )}
                                                {request.type === 'WITHDRAWAL' && request.upiId && (
                                                    <div className="text-xs font-mono text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded border border-[var(--danger)]/20 select-all">
                                                        UPI: {request.upiId}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className={`text-3xl font-black font-mono tracking-tight ${request.type === 'DEPOSIT' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                                {request.type === 'DEPOSIT' ? '+' : '-'}₹{request.amount.toLocaleString()}
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${request.type === 'DEPOSIT' ? 'text-[var(--success)]' : 'text-[var(--danger)]'} text-opacity-80`}>
                                                {request.type}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAction(request._id, 'approve')}
                                                className="p-3 bg-[var(--success)] text-black rounded-xl hover:scale-105 hover:shadow-[0_0_20px_var(--success-glow)] transition-all active:scale-95"
                                                title="Approve Transaction"
                                            >
                                                <Check size={24} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(request._id, 'reject')}
                                                className="p-3 bg-[var(--surface-3)] text-[var(--danger)] border border-[var(--danger)]/30 rounded-xl hover:bg-[var(--danger)] hover:text-white hover:shadow-[0_0_20px_var(--danger-glow)] transition-all active:scale-95"
                                                title="Reject Transaction"
                                            >
                                                <X size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    ) : (
                        // History Tab
                        history.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--surface-1)] rounded-2xl border border-white/5 mx-auto max-w-lg">
                                <History className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-4 opacity-50" />
                                <h3 className="text-white font-bold text-lg">No History Found</h3>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-[var(--surface-1)] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'APPROVED'
                                            ? 'bg-[var(--success)]/10 text-[var(--success)]'
                                            : 'bg-[var(--danger)]/10 text-[var(--danger)]'
                                            }`}>
                                            {item.status === 'APPROVED' ? <Check size={18} /> : <X size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{item.userId?.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">Processed by: <span className="text-[var(--primary)]">{item.processedBy?.name || 'Admin'}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold font-mono text-white">₹{item.amount.toLocaleString()}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{new Date(item.processedAt).toLocaleString()}</div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
