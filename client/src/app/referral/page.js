'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Copy, Users, IndianRupee, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReferralPage() {
    const { user } = useAuth();

    if (!user) return <div className="text-white text-center pt-20">Please login</div>;

    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referralCode || ''}` : '';

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied!');
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 text-center">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Invite Friends & <span className="text-yellow-400">Earn Forever</span></h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                            Get <span className="font-bold text-white">1% Commission</span> on every bet your friends place. No limits, lifetime earnings!
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 px-6 text-white font-mono border border-white/20 w-full truncate">
                                {referralLink || 'Loading...'}
                            </div>
                            <Button onClick={copyLink} className="whitespace-nowrap flex items-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8 py-3 h-auto rounded-xl">
                                <Copy size={18} /> Copy Link
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-surface-2 border-surface-3 p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <IndianRupee size={32} />
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Earnings</h3>
                            <p className="text-4xl font-bold text-white mt-1">₹{user.referralEarnings || 0}</p>
                            <p className="text-green-500 text-xs mt-1 flex items-center gap-1">Lifetime Commission</p>
                        </div>
                    </Card>

                    <Card className="bg-surface-2 border-surface-3 p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <Users size={32} />
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Invites</h3>
                            <p className="text-4xl font-bold text-white mt-1">{user.referralCount || 0}</p>
                            <p className="text-blue-500 text-xs mt-1">Registered Users</p>
                        </div>
                    </Card>
                </div>

                {/* How It Works */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5">
                        <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center mx-auto mb-4 text-purple-400">
                            <Share2 size={24} />
                        </div>
                        <h3 className="text-white font-bold mb-2">1. Share Code</h3>
                        <p className="text-gray-400 text-sm">Send your unique referral link to friends via WhatsApp or Telegram.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5">
                        <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center mx-auto mb-4 text-pink-400">
                            <Users size={24} />
                        </div>
                        <h3 className="text-white font-bold mb-2">2. They Play</h3>
                        <p className="text-gray-400 text-sm">Friends register and start playing games on WinZone.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5">
                        <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center mx-auto mb-4 text-yellow-400">
                            <IndianRupee size={24} />
                        </div>
                        <h3 className="text-white font-bold mb-2">3. You Earn</h3>
                        <p className="text-gray-400 text-sm">Get instant balance added to your wallet for every bet they place.</p>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}
