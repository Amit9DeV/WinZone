"use client";

import { useState } from 'react';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = ["❤️", "😂", "🔥", "🚀", "💰", "💸", "🎰", "😎", "🤔", "👎", "👍", "👀"];

export default function EmojiPicker({ onSelect }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-text-muted hover:text-white p-2 transition-colors"
            >
                <Smile size={20} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 bg-surface-1 border border-white/10 rounded-lg p-2 shadow-xl z-50 grid grid-cols-4 gap-1 w-48">
                        {COMMON_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onSelect(emoji);
                                    setIsOpen(false);
                                }}
                                className="hover:bg-surface-2 rounded p-1 text-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
