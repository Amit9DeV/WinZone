'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Check, X, Clock, DollarSign, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-100 w-fit">
                {['requests', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : activeTab === 'requests' ? (
                        requests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <DollarSign className="text-gray-400" />
                                </div>
                                <p>No pending requests</p>
                            </div>
                        ) : (
                            requests.map((request, index) => (
                                <motion.div
                                    key={request._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <ArrowDownLeft size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{request.userId?.name}</h3>
                                            <p className="text-sm text-gray-500">{request.userId?.email}</p>
                                            <div className="flex items-center mt-1 text-xs text-gray-400">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(request.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">₹{request.amount.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Deposit Request</div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(request._id, 'approve')}
                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                title="Approve"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(request._id, 'reject')}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    ) : (
                        // History Tab
                        history.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p>No history found</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {item.status === 'APPROVED' ? <Check size={20} /> : <X size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.userId?.name}</div>
                                            <div className="text-xs text-gray-500">Processed by: {item.processedBy?.name || 'Admin'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">₹{item.amount.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{new Date(item.processedAt).toLocaleString()}</div>
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
