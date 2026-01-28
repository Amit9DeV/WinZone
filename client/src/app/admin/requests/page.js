"use client";

import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WalletRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/wallet/requests`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => { // action: 'approve' | 'reject'
        setProcessingId(requestId);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/wallet/${action}/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ notes: `Admin ${action}d` })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Request ${action}d successfully`);
                setRequests(requests.filter(r => r._id !== requestId));
            } else {
                toast.error(data.message || `Failed to ${action}`);
            }
        } catch (error) {
            toast.error(`Error processing request`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Wallet Requests</h1>
                <div className="text-sm text-gray-400">
                    <span className="text-yellow-500 font-bold">{requests.length}</span> Pending
                </div>
            </div>

            <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {requests.map(req => (
                            <tr key={req._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${req.type === 'DEPOSIT'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {req.type === 'DEPOSIT' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                                        {req.type}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{req.userId?.name || 'Unknown User'}</div>
                                    <div className="text-xs text-gray-500">{req.userId?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-white">
                                    ₹{req.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    {req.type === 'DEPOSIT' ? (
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-500 block">UTR / Ref:</span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded select-all">{req.utr}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-500 block">UPI ID:</span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded select-all">{req.upiId}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {new Date(req.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAction(req._id, 'approve')}
                                            disabled={!!processingId}
                                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black rounded-lg transition-all disabled:opacity-50"
                                            title="Approve"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(req._id, 'reject')}
                                            disabled={!!processingId}
                                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                            title="Reject"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="flex justify-center mb-4">
                            <CheckCircle size={48} className="text-green-500/20" />
                        </div>
                        <p>No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
