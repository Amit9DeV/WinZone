'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Search, Filter, MoreVertical, Shield, User as UserIcon, Ban, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceReason, setBalanceReason] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (user) => {
        if (!confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.name}?`)) return;

        try {
            const response = await adminAPI.updateUserStatus(user._id, !user.isBanned);
            if (response.data.success) {
                toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully`);
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleBalanceUpdate = async (e) => {
        e.preventDefault();
        if (!selectedUser || !balanceAmount) return;

        try {
            const response = await adminAPI.updateUserBalance(
                selectedUser._id,
                parseFloat(balanceAmount),
                balanceReason
            );
            if (response.data.success) {
                toast.success('Balance updated successfully');
                setShowBalanceModal(false);
                setBalanceAmount('');
                setBalanceReason('');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to update balance');
        }
    };

    const openBalanceModal = (user) => {
        setSelectedUser(user);
        setShowBalanceModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Cards (Visible < md) */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center p-4 text-gray-500">Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">No users found</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className={`bg-white p-4 rounded-xl shadow border border-gray-100 ${user.isBanned ? 'bg-red-50' : ''}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.isBanned ? 'bg-red-100 text-red-700' : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'}`}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-3">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase">Balance</div>
                                    <div className="font-bold text-gray-900">₹{user.balance?.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase">Stats</div>
                                    <div className="text-sm">
                                        <span className="text-green-600 font-bold">{user.totalWins || 0}W</span> / <span className="text-red-600 font-bold">{user.totalBets || 0}L</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => openBalanceModal(user)}
                                    className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                >
                                    <DollarSign size={16} /> Adjust Balance
                                </button>
                                <button
                                    onClick={() => handleBanToggle(user)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${user.isBanned ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                                >
                                    <Ban size={16} /> {user.isBanned ? 'Unban' : 'Ban'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table (Hidden < md) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            {/* ... existing table header ... */}
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* ... existing table body ... */}
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-gray-50 transition-colors ${user.isBanned ? 'bg-red-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.isBanned ? 'bg-red-100 text-red-700' : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
                                                    }`}>
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                        {user.isBanned && <span className="ml-2 text-xs text-red-600 font-bold">(BANNED)</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role === 'ADMIN' ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">₹{user.balance?.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                <span className="text-green-600 font-medium">{user.totalWins || 0}W</span>
                                                <span className="mx-1">/</span>
                                                <span className="text-red-600 font-medium">{user.totalBets || 0}L</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openBalanceModal(user)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Adjust Balance"
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(user)}
                                                    className={`p-1 rounded ${user.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                                    title={user.isBanned ? 'Unban User' : 'Ban User'}
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Balance Modal */}
            <AnimatePresence>
                {showBalanceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md m-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Adjust Balance for {selectedUser?.name}</h3>
                                <button onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleBalanceUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        placeholder="Enter amount (negative to deduct)"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use negative value to deduct balance</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                                    <input
                                        type="text"
                                        value={balanceReason}
                                        onChange={(e) => setBalanceReason(e.target.value)}
                                        placeholder="e.g. Bonus, Correction"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowBalanceModal(false)}
                                        className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Update Balance
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
