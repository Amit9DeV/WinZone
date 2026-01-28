'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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
    Headphones,
    Languages,
    MessageCircle
} from 'lucide-react';
import { Button } from './ui';
import Footer from './Footer';
import ChatSidebar from './Chat/ChatSidebar';
import DailyRewardModal from './DailyReward/DailyRewardModal';
import HelpChatbot from './HelpChatbot';
import LiveBetsFeed from './LiveBetsFeed';
import ThemeToggle from './ThemeToggle';
import AnimatedLogo from './AnimatedLogo';

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
    <Link href={href}>
        <div className={`
      flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
      ${active
                ? 'bg-surface-2 text-white'
                : 'text-text-muted hover:bg-surface-2 hover:text-white'
            }
    `}>
            <Icon size={18} className={`relative z-10 ${active ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
            {!collapsed && (
                <span className="font-medium text-sm relative z-10">{label}</span>
            )}
            {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
        </div>
    </Link>
);

export default function MainLayout({ children, showChatbot = false }) {
    const { user, balance, logout } = useAuth();
    const { t, locale, switchLanguage } = useLanguage();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    if (!user && (pathname === '/login' || pathname === '/register')) {
        return children;
    }

    const navItems = [
        { icon: Home, label: t.nav.home, href: '/' },
        { icon: Gamepad2, label: t.nav.games, href: '/games' },
        { icon: Wallet, label: t.nav.wallet, href: '/wallet' },
        { icon: User, label: t.nav.profile, href: '/profile' },
        { icon: Headphones, label: t.nav.support, href: '/contact' },
    ];

    const LanguageToggle = () => (
        <button
            onClick={() => switchLanguage(locale === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-2 hover:bg-surface-3 transition-colors text-xs font-bold text-white uppercase"
        >
            <Languages size={14} className="text-text-muted" />
            {locale === 'en' ? 'HI' : 'EN'}
        </button>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar (Desktop) */}
            <aside
                className={`hidden md:flex flex-col border-r border-white/5 bg-surface-1 fixed h-full z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="p-5 flex items-center justify-between h-16 border-b border-white/5">
                    {!collapsed && <AnimatedLogo />}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 hover:bg-surface-2 rounded-lg text-text-muted hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    {!collapsed && (
                        <div className="flex justify-center">
                            <LanguageToggle />
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 mb-10 px-3 py-3 rounded-lg text-text-muted hover:bg-surface-2 hover:text-white transition-all w-full ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} className='text-red-500' />
                        {!collapsed && <span className="text-sm font-medium text-red-500">{t.nav.logout}</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-surface-1 border-b border-white/5 z-50 px-4 h-14 flex items-center justify-between shadow-lg">
                <AnimatedLogo />
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageToggle />
                    <div className="flex items-center gap-2 bg-surface-2 px-3 py-1 rounded border border-white/5">
                        <span className="font-bold text-green-500 text-xs">₹{Math.floor(balance || 0)}</span>
                    </div>
                    <button onClick={() => setChatOpen(true)} className="text-white p-1 hover:text-primary transition-colors">
                        <MessageCircle size={20} />
                    </button>
                    <button onClick={() => setMobileOpen(true)} className="text-white p-1">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer - Simplified */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        className="mobile-overlay fixed inset-0 bg-black/70 z-50 md:hidden"
                    />
                    <div className="mobile-drawer fixed right-0 top-0 h-full w-72 bg-surface-1 z-50 p-5 md:hidden shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <span className="text-lg font-bold text-white">Menu</span>
                            <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${pathname === item.href ? 'bg-surface-2 text-white' : 'text-text-muted'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                            <Button onClick={logout} className="w-full mt-4 bg-surface-2 hover:bg-surface-3 text-white border-0">
                                {t.nav.logout}
                            </Button>
                        </nav>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'} pt-14 md:pt-0`}>
                {/* Desktop Header */}
                <header className="hidden md:flex h-16 items-center justify-end px-6 sticky top-0 z-30 bg-surface-1/95 border-b border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageToggle />

                        <div className="flex items-center gap-3 bg-surface-3 px-4 py-2 rounded shadow-inner border border-white/5">
                            <span className="font-bold text-green-500 text-sm">₹{Math.floor(balance || 0)}</span>
                            <div className="h-4 w-px bg-white/10"></div>
                            <Button variant="primary" className="px-3 py-0.5 text-xs h-6 bg-primary hover:bg-primary-hover text-black font-bold border-0">
                                {t.wallet.deposit}
                            </Button>
                        </div>

                        <button onClick={() => setChatOpen(true)} className="text-text-muted hover:text-primary transition-colors">
                            <MessageCircle size={18} />
                        </button>

                        <button className="relative text-text-muted hover:text-white transition-colors">
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface-1" />
                        </button>

                        <div className="w-8 h-8 rounded bg-surface-3 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 max-w-[1400px] mx-auto min-h-[calc(100vh-4rem)]">
                    {children}
                </div>

                {/* Footer */}
                <Footer />
            </main>

            <style jsx>{`
                .mobile-overlay {
                    animation: fadeIn 0.2s ease;
                }
                .mobile-drawer {
                    animation: slideIn 0.2s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>

            {/* Chat Sidebar */}
            <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />

            {/* Daily Reward Modal */}
            <DailyRewardModal />

            {/* Help Chatbot (only on certain pages) */}
            {showChatbot && <HelpChatbot />}

            {/* Live Bets Feed */}
            <LiveBetsFeed />
        </div>
    );
}
