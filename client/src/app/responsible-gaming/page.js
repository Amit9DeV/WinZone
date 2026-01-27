'use client';

import MainLayout from '@/components/MainLayout';
import { Heart, Phone, Shield, Ban } from 'lucide-react';

export default function ResponsibleGamingPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} className="text-pink-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Responsible Gaming</h1>
                    <p className="text-gray-400">Your wellbeing is our priority</p>
                </div>

                {/* Emergency Help */}
                <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-red-500 mb-3 flex items-center gap-2">
                        <Phone size={24} />
                        Problem Gambling Helpline
                    </h2>
                    <p className="text-white text-lg mb-2">If you need immediate help:</p>
                    <p className="text-2xl font-bold text-primary">1-800-522-4700</p>
                    <p className="text-sm text-gray-400 mt-2">24/7 confidential support in India</p>
                </div>

                {/* Content */}
                <div className="bg-surface-1 rounded-xl p-6 md:p-8 space-y-6 border border-white/10">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">What is Responsible Gaming?</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Responsible gaming means enjoying games as entertainment while maintaining control over
                            your time and money. It's about making informed decisions and recognizing when gaming
                            becomes a problem.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">Warning Signs</h2>
                        <p className="text-gray-300 mb-3">You may have a problem if you:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Spend more time or money than intended</li>
                            <li>Chase losses by betting more to recover</li>
                            <li>Borrow money to gamble</li>
                            <li>Neglect work, family, or responsibilities</li>
                            <li>Feel anxious or irritable when not gaming</li>
                            <li>Lie to others about your gaming habits</li>
                            <li>Use gaming to escape problems or emotions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">Tips for Safe Gaming</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">💰 Set Limits</h3>
                                <p className="text-sm text-gray-300">Decide on a budget before playing and stick to it. Never chase losses.</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">⏰ Time Limits</h3>
                                <p className="text-sm text-gray-300">Set a time limit for each session. Take regular breaks.</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">🚫 Don't Borrow</h3>
                                <p className="text-sm text-gray-300">Never gamble with borrowed money or money needed for essentials.</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">🎯 Keep Perspective</h3>
                                <p className="text-sm text-gray-300">Gaming is entertainment, not a way to make money.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">Self-Exclusion</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            If you feel you're losing control, you can request a temporary or permanent ban from WinZone:
                        </p>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <Ban size={18} className="text-yellow-500" />
                                How to Self-Exclude
                            </h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                                <li>Email <span className="text-primary">support@winzone.com</span> with subject "Self-Exclusion Request"</li>
                                <li>Choose duration: 1 week, 1 month, 6 months, or permanent</li>
                                <li>Your account will be locked immediately</li>
                                <li>Remaining balance will be refunded within 48 hours</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">Account Controls</h2>
                        <p className="text-gray-300 mb-3">Manage your gaming via your profile settings:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Deposit Limits:</strong> Set daily, weekly, or monthly limits</li>
                            <li><strong>Loss Limits:</strong> Cap how much you can lose in a period</li>
                            <li><strong>Session Time Limits:</strong> Auto-logout after specified duration</li>
                            <li><strong>Reality Checks:</strong> Reminders showing time and money spent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">Help Resources</h2>
                        <div className="space-y-3">
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-1">Gamblers Anonymous</h3>
                                <p className="text-sm text-gray-400">Website: <span className="text-primary">www.gamblersanonymous.org.in</span></p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-1">National Council on Problem Gambling</h3>
                                <p className="text-sm text-gray-400">Hotline: 1-800-522-4700 (24/7)</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-1">GamCare</h3>
                                <p className="text-sm text-gray-400">Website: <span className="text-primary">www.gamcare.org.uk</span></p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">For Friends & Family</h2>
                        <p className="text-gray-300 leading-relaxed">
                            If someone you know has a gambling problem, approach them with care and without judgment.
                            Encourage them to seek professional help and offer your support. Visit
                            <span className="text-primary"> www.gam-anon.org</span> for resources for families affected
                            by problem gambling.
                        </p>
                    </section>
                </div>

                {/* Footer CTA */}
                <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                    <Shield size={48} className="text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">We're Here to Help</h2>
                    <p className="text-gray-300 mb-4">
                        If you have concerns about your gaming, don't wait. Contact us or one of the helplines above.
                    </p>
                    <button className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-hover transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
