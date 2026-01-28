'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-[var(--surface-1)]/90 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8 sticky top-0 z-30 shadow-lg">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-[var(--surface-2)] border border-white/5 rounded-xl px-4 py-2 w-64 md:w-96 focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all">
                <Search size={18} className="text-[var(--text-muted)] mr-3" />
                <input
                    type="text"
                    placeholder="Search ecosystem..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-gray-500"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4 md:space-x-6">
                {/* Notifications */}
                <button className="relative text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-2 hover:bg-[var(--primary)]/10 rounded-lg">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--danger)] rounded-full shadow-[0_0_5px_var(--danger-glow)]"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 border-l pl-4 md:pl-6 border-white/10">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white">{user?.name || 'Admin'}</div>
                        <div className="text-[10px] text-[var(--primary)] font-mono uppercase tracking-wider">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-black shadow-[0_0_10px_var(--primary-glow)] border border-white/20">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
}
