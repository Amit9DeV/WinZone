"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Gamepad2, ShieldAlert, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'ADMIN') return null;

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Wallet Requests', href: '/admin/requests', icon: ShieldAlert },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Game Control', href: '/admin/games', icon: Gamepad2 },
        // { name: 'Risk & Fraud', href: '/admin/risk', icon: ShieldAlert },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside
                className={`fixed md:relative z-50 h-screen bg-surface-1 border-r border-white/10 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
                    } flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
                    <div className={`font-black text-primary text-xl flex items-center gap-2 overflow-hidden ${!isSidebarOpen && 'justify-center'}`}>
                        {isSidebarOpen ? 'WINZONE ADMIN' : 'WZ'}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/20 text-primary font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title={item.name}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center gap-3 p-3 text-gray-400 hover:text-white w-full rounded-lg hover:bg-white/5 mb-2"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        {isSidebarOpen && <span>Collapse</span>}
                    </button>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 w-full rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen bg-background overflow-y-auto">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-surface-1/50 backdrop-blur-md sticky top-0 z-40">
                    <h2 className="font-bold text-lg capitalize">{pathname.split('/').pop() || 'Dashboard'}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-400">System Online</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-xs ring-2 ring-primary/50">
                            A
                        </div>
                    </div>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
