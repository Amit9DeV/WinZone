'use client';

import Link from 'next/link';
import { Github, Twitter, Instagram, Heart, Mail, Shield, Zap } from 'lucide-react';
import { Button } from './ui';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-white/5 bg-surface-1/30 backdrop-blur-xl relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-block group">
                            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-shine group-hover:scale-105 transition-transform duration-300 inline-block">
                                WinZone
                            </span>
                        </Link>
                        <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                            The next generation of fair online gaming.
                            Experience instant withdrawals, provably fair algorithms, and 24/7 VIP support.
                        </p>

                        <div className="flex gap-4">
                            <SocialLink icon={Twitter} href="#" color="hover:text-blue-400 hover:bg-blue-500/10" />
                            <SocialLink icon={Instagram} href="#" color="hover:text-pink-400 hover:bg-pink-500/10" />
                            <SocialLink icon={Github} href="#" color="hover:text-white hover:bg-white/10" />
                            <SocialLink icon={Mail} href="/contact" color="hover:text-green-400 hover:bg-green-500/10" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-bold text-lg">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><FooterLink href="/games">All Games</FooterLink></li>
                            <li><FooterLink href="/live">Live Casino</FooterLink></li>
                            <li><FooterLink href="/promotions">Promotions</FooterLink></li>
                            <li><FooterLink href="/vip">VIP Club</FooterLink></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-bold text-lg">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><FooterLink href="/contact">Help Center</FooterLink></li>
                            <li><FooterLink href="/fairness">Provably Fair</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-white font-bold text-lg">Stay Updated</h4>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 border border-white/5 shadow-xl">
                            <div className="flex items-center gap-3 mb-4 text-purple-300">
                                <Zap size={20} className="fill-current" />
                                <span className="font-bold text-sm">Join the Community</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">
                                Get exclusive bonuses and game drops straight to your inbox.
                            </p>
                            <Button className="w-full text-sm py-2">
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} WinZone Corp.</p>
                        <div className="hidden md:block w-px h-3 bg-white/10"></div>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><Shield size={12} /> SSL Secured</span>
                            <span>18+ Play Responsibly</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <span>Made with</span>
                        <Heart size={12} className="text-red-500 fill-current animate-pulse" />
                        <span>for the players</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href, color }) {
    return (
        <a
            href={href}
            className={`w-10 h-10 rounded-xl bg-surface-2 border border-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg ${color}`}
        >
            <Icon size={18} />
        </a>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link
            href={href}
            className="block hover:text-white hover:translate-x-1 transition-all duration-200"
        >
            {children}
        </Link>
    );
}
