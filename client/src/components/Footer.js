'use client';

import Link from 'next/link';
import { Github, Twitter, Instagram, Heart, Mail, Shield, Zap } from 'lucide-react';
import { Button } from './ui';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-white/5 bg-surface-1/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-4">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                WinZone
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
                            The next generation of fair online gaming.
                            Experience instant withdrawals, provably fair algorithms, and 24/7 VIP support.
                        </p>

                        <div className="flex gap-3">
                            <SocialLink icon={Twitter} href="#" color="hover:text-blue-400 hover:bg-blue-500/10" />
                            <SocialLink icon={Instagram} href="#" color="hover:text-pink-400 hover:bg-pink-500/10" />
                            <SocialLink icon={Github} href="#" color="hover:text-white hover:bg-white/10" />
                            <SocialLink icon={Mail} href="/contact" color="hover:text-green-400 hover:bg-green-500/10" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-white font-bold text-base md:text-lg">Platform</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><FooterLink href="/games">All Games</FooterLink></li>
                            <li><FooterLink href="/live">Live Casino</FooterLink></li>
                            <li><FooterLink href="/promotions">Promotions</FooterLink></li>
                            <li><FooterLink href="/vip">VIP Club</FooterLink></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-white font-bold text-base md:text-lg">Support</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><FooterLink href="/contact">Help Center</FooterLink></li>
                            <li><FooterLink href="/fairness">Provably Fair</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-white font-bold text-base md:text-lg">Stay Updated</h4>
                        <div className="p-5 rounded-xl bg-gradient-to-br from-surface-2 to-surface-1 border border-white/5">
                            <div className="flex items-center gap-2 mb-3 text-purple-300">
                                <Zap size={18} className="fill-current" />
                                <span className="font-bold text-sm">Join the Community</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">
                                Get exclusive bonuses and game drops straight to your inbox.
                            </p>
                            <Button className="w-full text-sm py-2">
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Rights & Links */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2026 WinZone. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
                        <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/disclaimer" className="text-gray-400 hover:text-primary transition-colors">
                            Disclaimer
                        </Link>
                        <Link href="/responsible-gaming" className="text-gray-400 hover:text-primary transition-colors">
                            Responsible Gaming
                        </Link>
                        <Link href="/fairness" className="text-gray-400 hover:text-primary transition-colors">
                            Fairness
                        </Link>
                    </div>
                </div>
                <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <span>Made with</span>
                        <Heart size={12} className="text-red-500 fill-current" />
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
            className={`w-10 h-10 rounded-lg bg-surface-2 border border-white/5 flex items-center justify-center text-gray-400 transition-all duration-200 hover:scale-105 ${color}`}
        >
            <Icon size={18} />
        </a>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link
            href={href}
            className="block hover:text-white transition-colors duration-200"
        >
            {children}
        </Link>
    );
}
