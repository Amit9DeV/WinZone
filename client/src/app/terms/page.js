'use client';

import MainLayout from '@/components/MainLayout';
import { Shield, FileText, AlertCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-gray-400">Last updated: January 26, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-surface-1 rounded-xl p-6 md:p-8 space-y-6 border border-white/10">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            By accessing and using WinZone ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>You must be at least 18 years old to use this platform</li>
                            <li>You must be legally permitted to participate in online gaming in your jurisdiction</li>
                            <li>You are responsible for ensuring compliance with local laws</li>
                            <li>One account per person - multiple accounts are prohibited</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Account Responsibilities</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">You agree to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Provide accurate and truthful information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Not share your account with others</li>
                            <li>Not use the platform for fraudulent activities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Game Rules & Fair Play</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">
                            All games on WinZone use provably fair algorithms. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Play fairly without using bots, scripts, or automation</li>
                            <li>Not exploit bugs or glitches (report them immediately)</li>
                            <li>Accept that all game outcomes are final</li>
                            <li>Understand that past results do not guarantee future outcomes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Deposits & Withdrawals</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Minimum deposit: ₹100</li>
                            <li>Minimum withdrawal: ₹100</li>
                            <li>Withdrawals processed within 24-48 hours</li>
                            <li>We reserve the right to request identity verification</li>
                            <li>Bonus funds may have wagering requirements</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Prohibited Activities</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">The following are strictly prohibited:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Money laundering or fraudulent transactions</li>
                            <li>Collusion with other players</li>
                            <li>Using VPNs to circumvent restrictions</li>
                            <li>Harassment or abusive behavior in chat</li>
                            <li>Reverse engineering or hacking attempts</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Account Suspension & Termination</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these terms,
                            engage in fraudulent activity, or abuse the platform. Remaining balances may be
                            forfeited in cases of severe violations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
                        <p className="text-gray-300 leading-relaxed">
                            WinZone is provided "as is" without warranties. We are not liable for losses
                            resulting from technical issues, server downtime, or force majeure events.
                            Your maximum liability is limited to your account balance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">9. Changes to Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may update these terms at any time. Continued use of the platform after
                            changes constitutes acceptance of the new terms. We will notify users of
                            significant changes via email or platform notifications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
                        <p className="text-gray-300 leading-relaxed">
                            For questions about these terms, contact us at: <span className="text-primary">support@winzone.com</span>
                        </p>
                    </section>
                </div>

                {/* Notice */}
                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3">
                    <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                        <strong className="text-yellow-500">Important:</strong> Online gaming involves financial risk.
                        Please play responsibly and within your means.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
