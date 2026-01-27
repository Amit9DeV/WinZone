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

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
    <Link href={href}>
        <div className={`
      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
      ${active
                ? 'bg-gradient-to-r from-surface-2 to-surface-1 text-white shadow-lg border border-white/5'
                : 'text-text-muted hover:bg-surface-2 hover:text-white'
            }
    `}>
            {active && <div className="absolute left-0 top-0 h-full w-1 bg-primary shadow-[0_0_10px_var(--primary)]" />}
            <Icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
            {!collapsed && (
                <span className="font-bold text-sm relative z-10">{label}</span>
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors text-xs font-bold text-white uppercase border border-white/5"
        >
            <Languages size={14} className="text-text-muted" />
            {locale === 'en' ? 'HI' : 'EN'}
        </button>
    );

    return (
        <div className="min-h-screen bg-background flex font-sans">
            {/* Sidebar (Desktop) */}
            <aside
                className={`hidden md:flex flex-col border-r border-white/5 bg-surface-1/50 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}
            >
                <div className="p-6 flex items-center justify-between h-20 border-b border-white/5">
                    {!collapsed && (
                        <div className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-1">
                            WIN<span className="text-primary drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]">ZONE</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-surface-2 rounded-xl text-text-muted hover:text-white transition-all active:scale-95"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-6">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4 bg-black/20">
                    {!collapsed && (
                        <div className="flex justify-center">
                            <LanguageToggle />
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all w-full border border-transparent hover:border-red-500/20 ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="text-sm font-bold">{t.nav.logout}</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-surface-1/90 backdrop-blur-md border-b border-white/5 z-50 px-4 h-16 flex items-center justify-between shadow-lg">
                <div className="text-xl font-black italic tracking-tighter text-white">
                    WIN<span className="text-primary drop-shadow-[0_0_5px_rgba(0,231,1,0.5)]">ZONE</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                        <span className="font-bold text-primary text-xs">₹{Math.floor(balance || 0)}</span>
                    </div>
                    <button onClick={() => setChatOpen(true)} className="text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                        <MessageCircle size={22} />
                    </button>
                    <button onClick={() => setMobileOpen(true)} className="text-white p-2 hover:bg-white/5 rounded-full">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        className="mobile-overlay fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
                    />
                    <div className="mobile-drawer fixed right-0 top-0 h-full w-[280px] bg-surface-1 z-50 p-6 md:hidden shadow-2xl border-l border-white/10 flex flex-col">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                            <span className="text-xl font-bold text-white">Menu</span>
                            <button onClick={() => setMobileOpen(false)} className="bg-surface-2 p-2 rounded-full text-text-muted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="space-y-2 flex-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-4 p-4 rounded-xl text-sm font-bold transition-all ${pathname === item.href ? 'bg-surface-2 text-white shadow-lg' : 'text-text-muted hover:bg-surface-2/50'
                                        }`}
                                >
                                    <item.icon size={20} className={pathname === item.href ? 'text-primary' : ''} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-text-muted font-bold uppercase">Language</span>
                                <LanguageToggle />
                            </div>
                            <Button onClick={logout} className="w-full py-3 bg-surface-2 hover:bg-red-500/20 text-white hover:text-red-500 border border-white/5">
                                {t.nav.logout}
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-72'} pt-16 md:pt-0`}>
                {/* Desktop Header */}
                <header className="hidden md:flex h-20 items-center justify-end px-8 sticky top-0 z-30 bg-surface-1/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
                    <div className="flex items-center gap-6">
                        <LanguageToggle />

                        <div className="flex items-center gap-4 bg-black/30 px-5 py-2.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[10px] text-text-muted font-bold uppercase">Balance</span>
                                <span className="font-bold text-primary text-base drop-shadow-[0_0_5px_rgba(0,231,1,0.3)]">₹{Math.floor(balance || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <Button variant="primary" className="px-5 py-1.5 text-xs h-9 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,231,1,0.4)] hover:shadow-[0_0_25px_rgba(0,231,1,0.6)] border-0 rounded-full transition-all hover:-translate-y-0.5">
                                {t.wallet.deposit}
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <button onClick={() => setChatOpen(true)} className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-3 transition-all">
                                <MessageCircle size={20} />
                            </button>

                            <button className="relative w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-3 transition-all">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-2 animate-pulse" />
                            </button>

                            <Link href="/profile">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface-2 to-surface-1 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 hover:ring-primary/50 transition-all cursor-pointer shadow-lg">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)]">
                    {children}
                </div>

                <Footer />
            </main>

            <style jsx>{`
                .mobile-overlay {
                    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .mobile-drawer {
                    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
