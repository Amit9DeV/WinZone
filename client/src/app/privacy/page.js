'use client';

import MainLayout from '@/components/MainLayout';
import { Shield, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-gray-400">Last updated: January 26, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-surface-1 rounded-xl p-6 md:p-8 space-y-6 border border-white/10">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p className="text-gray-300 mb-3">We collect the following types of information:</p>

                        <h3 className="font-semibold text-white mb-2">Personal Information</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-3">
                            <li>Name and email address</li>
                            <li>Date of birth (for age verification)</li>
                            <li>Payment information (processed securely)</li>
                            <li>Identity documents (for KYC verification)</li>
                        </ul>

                        <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>IP address and device information</li>
                            <li>Browser type and version</li>
                            <li>Game activity and bet history</li>
                            <li>Chat messages</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>To provide and improve our gaming services</li>
                            <li>To process deposits and withdrawals</li>
                            <li>To prevent fraud and ensure platform security</li>
                            <li>To comply with legal and regulatory requirements</li>
                            <li>To send important updates and notifications</li>
                            <li>To personalize your gaming experience</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Data Storage & Security</h2>
                        <p className="text-gray-300 leading-relaxed mb-3">
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>SSL/TLS encryption for all data transmission</li>
                            <li>Secure password hashing (bcrypt)</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Restricted access to personal data (need-to-know basis)</li>
                            <li>Data stored on secure MongoDB servers</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Cookies & Tracking</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Maintain your login session</li>
                            <li>Remember your preferences (language, settings)</li>
                            <li>Analyze platform usage (Google Analytics)</li>
                            <li>Prevent fraudulent activity</li>
                        </ul>
                        <p className="text-gray-400 text-sm mt-3">
                            You can disable cookies in your browser, but some features may not work properly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">
                            We may share limited data with trusted third parties:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Payment Processors:</strong> To handle deposits/withdrawals</li>
                            <li><strong>Analytics Providers:</strong> To understand usage patterns</li>
                            <li><strong>Cloud Hosting:</strong> For server infrastructure (Render, MongoDB Atlas)</li>
                            <li><strong>Email Services:</strong> For transactional emails</li>
                        </ul>
                        <p className="text-gray-400 text-sm mt-3">
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We retain your data for as long as your account is active, plus 5 years after closure
                            for legal compliance. You may request account deletion, subject to regulatory requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request data deletion (subject to legal obligations)</li>
                            <li>Export your data (data portability)</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Object to automated decision-making</li>
                        </ul>
                        <p className="text-gray-400 text-sm mt-3">
                            To exercise these rights, contact us at: <span className="text-primary">privacy@winzone.com</span>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Children's Privacy</h2>
                        <p className="text-gray-300 leading-relaxed">
                            WinZone is strictly for users 18 years and older. We do not knowingly collect data from minors.
                            If we discover a minor has registered, their account will be immediately terminated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">9. International Users</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Your data may be processed in countries outside your jurisdiction. By using WinZone,
                            you consent to this transfer. We ensure adequate protection regardless of location.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may update this policy periodically. We will notify you of significant changes
                            via email or platform notification. Continued use constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">11. Contact Us</h2>
                        <p className="text-gray-300 leading-relaxed">
                            For privacy concerns or data requests: <span className="text-primary">privacy@winzone.com</span>
                        </p>
                    </section>
                </div>

                {/* Security Badge */}
                <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3">
                    <Lock size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                        <strong className="text-green-500">Your data is encrypted and secure.</strong> We never share
                        your information without consent.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
