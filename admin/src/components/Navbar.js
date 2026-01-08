'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-gray-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-2xl font-bold">
                            👑 Admin Panel
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-400">{user.name}</div>
                            <div className="text-xs text-gray-500">Administrator</div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
