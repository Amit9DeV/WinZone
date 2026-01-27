'use client';

import MainLayout from '@/components/MainLayout';
import { AlertTriangle, Info } from 'lucide-react';

export default function DisclaimerPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Disclaimer</h1>
                    <p className="text-gray-400">Important Legal Information</p>
                </div>

                {/* Warning Banner */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-red-500 mb-3 flex items-center gap-2">
                        <AlertTriangle size={24} />
                        Risk Warning
                    </h2>
                    <p className="text-gray-200 leading-relaxed">
                        Online gaming involves financial risk. You may lose all funds you wager.
                        Never gamble with money you cannot afford to lose. If you have a gambling problem,
                        please seek help immediately.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-surface-1 rounded-xl p-6 md:p-8 space-y-6 border border-white/10">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. No Guarantee of Winnings</h2>
                        <p className="text-gray-300 leading-relaxed">
                            All games on WinZone are games of chance. There is <strong>no guarantee</strong> that
                            you will win. Past results do not predict future outcomes. The platform has a mathematical
                            house edge on all games, meaning long-term expected value favors the house.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Financial Risk</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>You acknowledge that you may lose all funds deposited</li>
                            <li>Only wager amounts you can afford to lose</li>
                            <li>Gaming should be for entertainment, not income</li>
                            <li>Set deposit and loss limits to control spending</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. No Professional Advice</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Information on this platform is for entertainment purposes only and does not constitute
                            financial, legal, or professional advice. Consult qualified professionals before making
                            financial decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Platform Availability</h2>
                        <p className="text-gray-300 leading-relaxed mb-2">
                            We strive for 99.9% uptime, but cannot guarantee uninterrupted service:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Server maintenance may cause temporary downtime</li>
                            <li>Technical issues may affect game functionality</li>
                            <li>We are not liable for losses during outages</li>
                            <li>Active bets during crashes may be voided or refunded</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Links</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Our platform may contain links to external websites. We are not responsible for
                            the content, privacy practices, or terms of third-party sites. Use them at your own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Accuracy of Information</h2>
                        <p className="text-gray-300 leading-relaxed">
                            While we strive for accuracy, we do not warrant that all information on the platform
                            (odds, statistics, help content) is error-free or up-to-date. Use your own judgment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Legal Compliance</h2>
                        <p className="text-gray-300 leading-relaxed">
                            You are solely responsible for ensuring that your use of WinZone complies with local laws.
                            Online gaming is illegal in some jurisdictions. If you are located in a restricted region,
                            <strong> do not use this platform</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Age Restriction</h2>
                        <p className="text-gray-300 leading-relaxed">
                            You must be at least <strong>18 years old</strong> to use this platform. By registering,
                            you confirm that you meet this requirement. Accounts of minors will be terminated immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h2>
                        <p className="text-gray-300 leading-relaxed">
                            WinZone, its owners, operators, and employees are not liable for:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2">
                            <li>Financial losses from gaming</li>
                            <li>Unauthorized account access (if you fail to secure your credentials)</li>
                            <li>Losses due to technical errors (unless caused by gross negligence)</li>
                            <li>Third-party actions or force majeure events</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">10. Changes to Disclaimer</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to update this disclaimer at any time. Continued use of the platform
                            constitutes acceptance of any changes.
                        </p>
                    </section>
                </div>

                {/* Help Resources */}
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Info size={18} className="text-blue-500" />
                            Need Help?
                        </h3>
                        <p className="text-sm text-gray-300">
                            Visit our <span className="text-primary cursor-pointer">Responsible Gaming</span> page
                            for resources and self-exclusion options.
                        </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h3 className="font-bold text-white mb-2">24/7 Support</h3>
                        <p className="text-sm text-gray-300">
                            Contact us at <span className="text-primary">support@winzone.com</span> for assistance.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
