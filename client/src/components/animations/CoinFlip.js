"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSound } from "@/context/SoundContext";

export default function CoinFlip({ result = null, onComplete }) {
    const [flipping, setFlipping] = useState(false);
    const { playSound } = useSound();

    useEffect(() => {
        if (result) {
            setFlipping(true);
            playSound('coin-flip');

            // Stop flipping after 2s
            const timer = setTimeout(() => {
                setFlipping(false);
                if (onComplete) onComplete();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [result, playSound, onComplete]);

    return (
        <div className="perspective-1000 w-32 h-32">
            <motion.div
                className="w-full h-full relative transform-style-3d cursor-pointer"
                animate={{
                    rotateY: flipping ? 1800 : (result === 'tails' ? 180 : 0)
                }}
                transition={{ duration: 2, ease: "easeOut" }}
            >
                {/* Heads Side */}
                <div className="absolute inset-0 backface-hidden rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center shadow-xl">
                    <div className="text-4xl font-bold text-yellow-800">H</div>
                </div>

                {/* Tails Side */}
                <div
                    className="absolute inset-0 backface-hidden rounded-full bg-gray-300 border-4 border-gray-500 flex items-center justify-center shadow-xl"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="text-4xl font-bold text-gray-700">T</div>
                </div>
            </motion.div>
        </div>
    );
}
