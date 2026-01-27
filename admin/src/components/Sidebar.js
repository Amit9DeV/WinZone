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
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
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
                        className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 text-white z-40 w-64 md:w-64 shadow-2xl flex flex-col`}
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                WinZone
                            </h1>
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
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-gray-800">
                            <button
                                onClick={logout}
                                className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
