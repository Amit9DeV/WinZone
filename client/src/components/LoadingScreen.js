'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Server, RefreshCw } from 'lucide-react';

const MESSAGES = [
    { time: 0, text: "🚀 Waking up server...", subtext: "This may take 30-60 seconds" },
    { time: 10, text: "⚙️ Server is starting...", subtext: "Loading resources" },
    { time: 20, text: "🔧 Almost ready...", subtext: "Establishing connections" },
    { time: 30, text: "⏳ Taking longer than usual...", subtext: "Please wait" },
    { time: 45, text: "🔄 Still working on it...", subtext: "Thanks for your patience" }
];

export default function LoadingScreen({ elapsedTime = 0 }) {
    // Find the appropriate message based on elapsed time
    const currentMessage = [...MESSAGES]
        .reverse()
        .find(msg => elapsedTime >= msg.time) || MESSAGES[0];

    const estimatedTime = Math.max(0, 60 - elapsedTime);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-gray-900 flex items-center justify-center"
            >
                <div className="text-center px-4 max-w-md">
                    {/* Animated Logo/Icon */}
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1.5, repeat: Infinity }
                        }}
                        className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-2xl shadow-primary/50"
                    >
                        <Server size={40} className="text-black" />
                    </motion.div>

                    {/* Main Message */}
                    <motion.h1
                        key={currentMessage.text}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-bold text-white mb-3"
                    >
                        {currentMessage.text}
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        key={currentMessage.subtext}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-400 text-sm mb-8"
                    >
                        {currentMessage.subtext}
                    </motion.p>

                    {/* Progress Spinner */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-gray-500 text-sm">
                            {elapsedTime}s elapsed
                        </span>
                    </div>

                    {/* Estimated Time */}
                    {estimatedTime > 0 && (
                        <div className="bg-black/30 rounded-lg p-3 mb-4 border border-white/5">
                            <p className="text-xs text-gray-500 mb-1">Estimated time remaining</p>
                            <p className="text-lg font-mono font-bold text-primary">
                                ~{estimatedTime}s
                            </p>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-6">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary-hover"
                            initial={{ width: '0%' }}
                            animate={{ width: `${Math.min((elapsedTime / 60) * 100, 100)}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Info Text */}
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>✨ Hosted on Render.com (Free Tier)</p>
                        <p>Server auto-sleeps after inactivity</p>
                    </div>

                    {/* Retry Button (after 45s) */}
                    {elapsedTime > 45 && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-surface-2 text-white rounded-lg hover:bg-surface-3 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={16} />
                            Refresh Page
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
