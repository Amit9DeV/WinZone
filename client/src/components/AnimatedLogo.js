"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function AnimatedLogo() {
    const { theme } = useTheme();

    return (
        <div className="relative flex items-center select-none group cursor-pointer">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl font-black italic tracking-tighter"
            >
                <span className="text-foreground transition-colors duration-300">
                    WIN
                </span>
                <span
                    className="text-primary animate-neon-pulse inline-block"
                    style={{ textShadow: theme === 'neon' ? '0 0 10px var(--primary)' : 'none' }}
                >
                    ZONE
                </span>
            </motion.div>

            {/* Sparkle/Glow effect on hover */}
            <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        </div>
    );
}
