'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wallet,
    Gamepad2,
    Plane,
    Settings,
    LogOut,
    Menu,
    X,
    Bot,
    ShieldAlert,
    Image,
    Ticket
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Users', icon: Users, href: '/users' },
    { name: 'Wallet', icon: Wallet, href: '/wallet' },
    { name: 'Games', icon: Gamepad2, href: '/games' },
    { name: 'Bots', icon: Bot, href: '/bots' },
    { name: 'Content', icon: Image, href: '/cms' },
    { name: 'Promos', icon: Ticket, href: '/promos' },
    { name: 'Risk', icon: ShieldAlert, href: '/risk' },
    { name: 'Aviator', icon: Plane, href: '/aviator' },
    { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button - Z-Index Higher than sidebar */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[var(--surface-1)] border border-white/10 text-white rounded-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} className="text-[var(--danger)]" /> : <Menu size={24} className="text-[var(--primary)]" />}
            </button>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`fixed top-0 left-0 h-full bg-[var(--surface-1)] border-r border-white/5 text-white z-40 w-64 md:w-64 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col`}
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50"></div>
                            <h1 className="text-3xl font-black italic tracking-tighter">
                                <span className="text-white">WIN</span>
                                <span className="text-[var(--primary)] neon-text-glow">ZONE</span>
                            </h1>
                            <div className="absolute bottom-0 right-4 text-[10px] text-[var(--secondary)] font-mono">ADMIN</div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)} // Close on mobile click
                                        className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group overflow-hidden ${isActive
                                            ? 'text-black font-bold shadow-[0_0_15px_var(--primary-glow)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        style={{
                                            background: isActive ? 'var(--primary)' : 'transparent'
                                        }}
                                    >
                                        <Icon size={20} className={isActive ? 'text-black' : 'text-gray-500 group-hover:text-[var(--primary)] transition-colors'} />
                                        <span className="font-medium relative z-10">{item.name}</span>
                                        {isActive && <div className="absolute inset-0 bg-white/20 blur-sm"></div>}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-lg text-white border border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:shadow-[0_0_10px_var(--danger-glow)] transition-all group"
                            >
                                <LogOut size={20} className="text-[var(--danger)] group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-[var(--danger)]">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
