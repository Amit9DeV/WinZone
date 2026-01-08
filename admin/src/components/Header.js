'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-6 md:px-8 pl-14 md:pl-8 sticky top-0 z-30">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-gray-700 rounded-lg px-3 py-2 w-64 md:w-96">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-gray-400"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-6">
                {/* Notifications */}
                <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 border-l pl-6 border-gray-700">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-semibold text-white">{user?.name || 'Admin'}</div>
                        <div className="text-xs text-gray-400">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
}
