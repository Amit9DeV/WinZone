"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSound } from "@/context/SoundContext";

export default function DiceRoll({ value = 1, rolling = false }) {
    const { playSound } = useSound();

    useEffect(() => {
        if (rolling) {
            playSound('dice-roll');
        }
    }, [rolling, playSound]);

    // Rotations for each face (1-6)
    const transforms = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(-90deg) rotateY(0deg)",
        3: "rotateX(0deg) rotateY(-90deg)",
        4: "rotateX(0deg) rotateY(90deg)",
        5: "rotateX(90deg) rotateY(0deg)",
        6: "rotateX(180deg) rotateY(0deg)",
    };

    return (
        <div className="perspective-1000 w-24 h-24 flex items-center justify-center">
            <motion.div
                className="w-16 h-16 relative transform-style-3d will-change-transform"
                animate={{
                    rotateX: rolling ? [0, 720, 1080] : undefined,
                    rotateY: rolling ? [0, 720, 1080] : undefined,
                    transform: rolling ? undefined : transforms[value]
                }}
                transition={{ duration: rolling ? 1 : 0.5, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div
                        key={num}
                        className="absolute inset-0 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center backface-hidden shadow-sm"
                        style={{
                            transform: getFaceTransform(num),
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        <span className="text-2xl font-bold text-black">{num}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

function getFaceTransform(num) {
    const t = {
        1: 'translateZ(32px)',
        2: 'rotateX(90deg) translateZ(32px)',
        3: 'rotateY(90deg) translateZ(32px)',
        4: 'rotateY(-90deg) translateZ(32px)',
        5: 'rotateX(-90deg) translateZ(32px)',
        6: 'rotateX(180deg) translateZ(32px)',
    };
    return t[num];
}
