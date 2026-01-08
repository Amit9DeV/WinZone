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
    X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Users', icon: Users, href: '/users' },
    { name: 'Wallet', icon: Wallet, href: '/wallet' },
    { name: 'Games', icon: Gamepad2, href: '/games' },
    { name: 'Aviator', icon: Plane, href: '/aviator' },
    { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ x: -250 }}
                        animate={{ x: 0 }}
                        exit={{ x: -250 }}
                        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-64'
                            } shadow-xl flex flex-col`}
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-gray-800">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                WinZone Admin
                            </h1>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-gray-800">
                            <button
                                onClick={logout}
                                className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
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
