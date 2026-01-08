'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HowToPlay({ title, rules }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors text-sm font-medium border border-white/5"
            >
                <HelpCircle size={16} />
                How to Play
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-1 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 m-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <HelpCircle className="text-purple-400" size={24} />
                                    {title}
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 text-gray-300">
                                {rules.map((rule, index) => (
                                    <div key={index} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-purple-400 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm leading-relaxed">{rule}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
