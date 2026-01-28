"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 1. Check localStorage
        const savedTheme = localStorage.getItem("theme");

        // 2. Check system preference if no saved theme
        if (!savedTheme && window.matchMedia("(prefers-color-scheme: light)").matches) {
            setTheme("light");
        } else if (savedTheme) {
            setTheme(savedTheme);
        }

        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    // Avoid hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
