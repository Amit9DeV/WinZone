'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Gamepad2,
    Wallet,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    Headphones
} from 'lucide-react';
import { Button } from './ui';
import Footer from './Footer';

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
    <Link href={href}>
        <div className={`
      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
      ${active
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }
    `}>
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
            )}
            <Icon size={20} className={`relative z-10 ${active ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:text-purple-400 transition-colors'}`} />
            {!collapsed && (
                <span className="font-medium relative z-10">{label}</span>
            )}
            {active && !collapsed && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)] relative z-10" />
            )}
        </div>
    </Link>
);

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    // If not logged in, just show children (login/register pages handle their own layout)
    if (!user && (pathname === '/login' || pathname === '/register')) {
        return children;
    }

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Gamepad2, label: 'Games', href: '/games' },
        { icon: Wallet, label: 'Wallet', href: '/wallet' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Headphones, label: 'Support', href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-background mesh-bg flex">
            {/* Sidebar (Desktop) */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 260 }}
                className="hidden md:flex flex-col border-r border-white/5 bg-surface-1 fixed h-full z-40"
            >
                <div className="p-6 flex items-center justify-between">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                        >
                            WinZone
                        </motion.div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-surface-1/80 backdrop-blur-md border-b border-white/5 z-50 px-4 h-16 flex items-center justify-between">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    WinZone
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-full border border-white/5">
                        <Wallet size={14} className="text-green-400" />
                        <span className="font-bold text-white text-sm">₹{Math.floor(user?.balance || 0)}</span>
                    </div>
                    <button onClick={() => setMobileOpen(true)} className="text-white p-1">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/80 z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 h-full w-64 bg-surface-1 z-50 p-6 md:hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <button onClick={() => setMobileOpen(false)} className="text-gray-400">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="space-y-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${pathname === item.href ? 'bg-white/10 text-white' : 'text-gray-400'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                ))}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 p-3 rounded-xl text-red-400 w-full"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-[260px]'} pt-16 md:pt-0`}>
                {/* Desktop Header */}
                <header className="hidden md:flex h-20 items-center justify-between px-8 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {/* Breadcrumbs or Page Title could go here */}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-surface-2 px-4 py-2 rounded-full border border-white/5">
                            <Wallet size={18} className="text-green-400" />
                            <span className="font-bold text-white">₹{Math.floor(user?.balance || 0)}</span>
                            <Button variant="primary" className="px-3 py-1 text-xs h-auto">
                                + Deposit
                            </Button>
                        </div>

                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-medium text-white">{user?.name}</div>
                                <div className="text-xs text-gray-400">Level 1</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>

                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
}
