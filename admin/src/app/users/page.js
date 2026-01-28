'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Search, Filter, Shield, User as UserIcon, Ban, DollarSign, X, Check } from 'lucide-react';
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
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <UserIcon className="text-[var(--secondary)]" size={32} />
                        USER <span className="text-[var(--secondary)]">DATABASE</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage players, roles, and balances.</p>
                </div>

                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--surface-2)] border border-white/10 rounded-xl focus:outline-none focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] text-white placeholder-gray-600 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Cards (Visible < md) */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center p-4 text-[var(--text-muted)] animate-pulse">Scanning users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center p-4 text-[var(--text-muted)]">No users found</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className={`glass-panel p-5 rounded-2xl relative overflow-hidden ${user.isBanned ? 'border-[var(--danger)]/50' : 'border-white/5'}`}>
                            {user.isBanned && <div className="absolute top-0 right-0 bg-[var(--danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">BANNED</div>}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${user.isBanned
                                        ? 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/30'
                                        : 'bg-[var(--secondary)]/20 text-[var(--secondary)] border border-[var(--secondary)]/30'
                                        }`}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-bold text-white text-lg">{user.name}</div>
                                        <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--surface-2)] p-4 rounded-xl mb-4 border border-white/5 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-1">Balance</div>
                                    <div className="font-mono font-bold text-white text-xl">₹{user.balance?.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-1">Win / Loss</div>
                                    <div className="text-sm font-mono">
                                        <span className="text-[var(--success)]">{user.totalWins || 0}W</span> <span className="text-white/20">|</span> <span className="text-[var(--danger)]">{user.totalBets || 0}L</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openBalanceModal(user)}
                                    className="flex-1 py-3 bg-[var(--surface-3)] text-[var(--primary)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary)] hover:text-black transition-all"
                                >
                                    <DollarSign size={18} /> Balance
                                </button>
                                <button
                                    onClick={() => handleBanToggle(user)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${user.isBanned
                                        ? 'bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)] hover:text-black'
                                        : 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white'
                                        }`}
                                >
                                    <Ban size={18} /> {user.isBanned ? 'Unban' : 'Ban'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table (Hidden < md) */}
            <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-[var(--surface-2)]">
                                <th className="px-6 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">W/L Stats</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-[var(--text-muted)] animate-pulse">Scanning user database...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-[var(--text-muted)]">No users found matching query</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-white/5 transition-colors group ${user.isBanned ? 'bg-[var(--danger)]/5' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${user.isBanned
                                                    ? 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/30'
                                                    : 'bg-[var(--secondary)]/20 text-[var(--secondary)] border border-[var(--secondary)]/30'
                                                    }`}>
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                                        {user.name}
                                                        {user.isBanned && <span className="text-[10px] bg-[var(--danger)] text-white px-1.5 py-0.5 rounded font-bold">BANNED</span>}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${user.role === 'ADMIN'
                                                ? 'bg-[var(--secondary)]/10 text-[var(--secondary)] border border-[var(--secondary)]/20'
                                                : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                                                }`}>
                                                {user.role === 'ADMIN' ? <Shield size={12} className="mr-1.5" /> : <UserIcon size={12} className="mr-1.5" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold font-mono text-[var(--primary)]">₹{user.balance?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono">
                                                <span className="text-[var(--success)] font-bold">{user.totalWins || 0}W</span>
                                                <span className="mx-2 text-white/20">|</span>
                                                <span className="text-[var(--danger)] font-bold">{user.totalBets || 0}L</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openBalanceModal(user)}
                                                    className="p-2 text-[var(--primary)] bg-[var(--primary)]/10 rounded-lg hover:bg-[var(--primary)] hover:text-black transition-all"
                                                    title="Adjust Balance"
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(user)}
                                                    className={`p-2 rounded-lg transition-all ${user.isBanned
                                                        ? 'text-[var(--success)] bg-[var(--success)]/10 hover:bg-[var(--success)] hover:text-black'
                                                        : 'text-[var(--danger)] bg-[var(--danger)]/10 hover:bg-[var(--danger)] hover:text-white'
                                                        }`}
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
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel rounded-2xl shadow-2xl p-6 w-full max-w-md border border-[var(--primary)]/30"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                <h3 className="text-xl font-bold text-white">Adjust Balance</h3>
                                <button onClick={() => setShowBalanceModal(false)} className="text-[var(--text-muted)] hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-xl border border-white/5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-[var(--secondary)]/20 text-[var(--secondary)] border border-[var(--secondary)]/30 flex items-center justify-center font-bold text-lg">
                                    {selectedUser?.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white font-bold">{selectedUser?.name}</div>
                                    <div className="text-xs text-[var(--text-muted)]">Current: <span className="text-[var(--primary)] font-mono">₹{selectedUser?.balance?.toLocaleString()}</span></div>
                                </div>
                            </div>

                            <form onSubmit={handleBalanceUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        placeholder="Enter amount (negative to deduct)"
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-600 transition-all font-mono"
                                    />
                                    <p className="text-xs text-[var(--text-muted)] mt-2 ml-1">Use negative value (e.g. -500) to deduct balance.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Reason</label>
                                    <input
                                        type="text"
                                        value={balanceReason}
                                        onChange={(e) => setBalanceReason(e.target.value)}
                                        placeholder="e.g. Bonus, Correction, Refund"
                                        className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/10 rounded-xl focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-600 transition-all"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowBalanceModal(false)}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-white font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-[var(--primary)] text-black rounded-xl hover:bg-[var(--primary)]/90 hover:shadow-[0_0_15px_var(--primary-glow)] font-bold transition-all flex items-center gap-2"
                                    >
                                        <Check size={18} strokeWidth={3} />
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
