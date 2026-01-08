'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button, Input, Card } from '@/components/ui';
import { Mail, MessageSquare, Send, Headphones, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ subject: '', message: '' });
        setLoading(false);
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">help you?</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Our dedicated support team is here to assist you 24/7.
                            Reach out to us via any of the channels below or send us a direct message.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Channels */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-surface-2 to-surface-1 border-white/5 hover:border-purple-500/30 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Email Support</h3>
                                        <p className="text-gray-400 text-sm mb-3">Get a response within 24 hours</p>
                                        <a href="mailto:support@winzone.com" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                            support@winzone.com
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-surface-2 to-surface-1 border-white/5 hover:border-purple-500/30 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Live Chat</h3>
                                        <p className="text-gray-400 text-sm mb-3">Instant support via Telegram</p>
                                        <a href="https://t.me/WinZoneSupport" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                            @WinZoneSupport
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-surface-2 to-surface-1 border-white/5 hover:border-purple-500/30 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Help Center</h3>
                                        <p className="text-gray-400 text-sm mb-3">Browse FAQs and guides</p>
                                        <span className="text-green-400 hover:text-green-300 font-medium transition-colors cursor-pointer">
                                            Visit Help Center
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="h-full border-white/5 bg-surface-2/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <Headphones className="text-purple-400" size={24} />
                                    <h2 className="text-xl font-bold text-white">Send us a message</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                        <Input
                                            placeholder="What is this regarding?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="bg-surface-1 border-white/10 focus:border-purple-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-surface-1 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                                            placeholder="Describe your issue in detail..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-4 text-lg font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send size={18} />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
