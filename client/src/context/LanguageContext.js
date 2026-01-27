'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState('en');
    const [t, setT] = useState(en);

    useEffect(() => {
        // Load preference from localStorage
        const savedLocale = localStorage.getItem('app-locale');
        if (savedLocale === 'hi') {
            setLocale('hi');
            setT(hi);
        }
    }, []);

    const switchLanguage = (lang) => {
        setLocale(lang);
        setT(lang === 'hi' ? hi : en);
        localStorage.setItem('app-locale', lang);
    };

    return (
        <LanguageContext.Provider value={{ locale, t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
