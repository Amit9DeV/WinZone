"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload } from 'lucide-react';
import UserAvatar from '../Chat/UserAvatar';

const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Robo',
    'https://api.dicebear.com/7.x/identicon/svg?seed=WinZone',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex'
];

export default function AvatarSelector({ currentAvatar, onSelect }) {
    const [customUrl, setCustomUrl] = useState('');
    const [selected, setSelected] = useState(currentAvatar);

    const handleSelect = (avatar) => {
        setSelected(avatar);
        onSelect(avatar);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-white font-bold mb-2">Choose Avatar</h3>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-3">
                {AVATAR_PRESETS.map((avatar, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(avatar)}
                        className={`
                            relative rounded-full aspect-square cursor-pointer overflow-hidden border-2 
                            ${selected === avatar ? 'border-primary shadow-[0_0_10px_var(--primary)]' : 'border-white/10 hover:border-white/30'}
                        `}
                    >
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        {selected === avatar && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check size={20} className="text-white drop-shadow-md" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Custom URL Input */}
            <div>
                <label className="text-xs text-gray-400 mb-1 block">Or use custom URL</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://imgur.com/..."
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                    <button
                        onClick={() => customUrl && handleSelect(customUrl)}
                        className="bg-surface-2 hover:bg-surface-3 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                        <Upload size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
