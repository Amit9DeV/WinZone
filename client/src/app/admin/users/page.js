"use client";

import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (userId, currentStatus) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
            const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ banned: !currentStatus })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`User ${!currentStatus ? 'Banned' : 'Unbanned'}`);
                setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentStatus } : u));
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-1 p-4 rounded-xl border border-white/10">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:border-primary focus:outline-none text-sm"
                    />
                </div>
            </div>

            <div className="bg-surface-1 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-green-400">
                                    ₹{user.balance.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {user.isBanned ? 'BANNED' : 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => toggleBan(user._id, user.isBanned)}
                                            className={`p-2 rounded hover:bg-white/10 transition-colors ${user.isBanned ? 'text-green-400' : 'text-red-400'}`}
                                            title={user.isBanned ? "Unban" : "Ban"}
                                        >
                                            {user.isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
}
