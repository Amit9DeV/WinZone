"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Zap } from "lucide-react";
import { useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: "dark", label: "Dark", icon: Moon, color: "text-blue-400" },
        { id: "light", label: "Light", icon: Sun, color: "text-amber-500" },
        { id: "neon", label: "Neon", icon: Zap, color: "text-pink-500" },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors border border-white/5"
                title="Change Theme"
            >
                {theme === "dark" && <Moon size={20} className="text-blue-400" />}
                {theme === "light" && <Sun size={20} className="text-amber-500" />}
                {theme === "neon" && <Zap size={20} className="text-pink-500" />}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-32 bg-surface-1 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2 transition-colors ${theme === t.id ? "bg-surface-2 text-primary" : "text-text-muted"
                                    }`}
                            >
                                <t.icon size={16} className={t.color} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
