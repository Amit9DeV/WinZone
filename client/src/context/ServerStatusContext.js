'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ServerStatusContext = createContext();

export const useServerStatus = () => {
    const context = useContext(ServerStatusContext);
    if (!context) {
        throw new Error('useServerStatus must be used within ServerStatusProvider');
    }
    return context;
};

export function ServerStatusProvider({ children }) {
    const [isOnline, setIsOnline] = useState(null); // null = checking, true = online, false = offline
    const [attempts, setAttempts] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const checkServerHealth = async () => {
        try {
            const SERVER_URL = 'https://winzone-final.onrender.com';
            const API_URL = process.env.NEXT_PUBLIC_API_URL || `${SERVER_URL}/api`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(`${API_URL}/health`, {
                signal: controller.signal,
                cache: 'no-store'
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                setIsOnline(true);
                return true;
            } else {
                throw new Error('Server not ready');
            }
        } catch (error) {
            console.log('Server health check failed:', error.message);
            return false;
        }
    };

    useEffect(() => {
        let intervalId;
        let timeIntervalId;

        const startChecking = async () => {
            setIsOnline(null); // Start checking
            const isUp = await checkServerHealth();

            if (isUp) {
                setIsOnline(true);
                return;
            }

            // Server is offline, start polling
            setIsOnline(false);
            setAttempts(0);
            setElapsedTime(0);

            // Start elapsed time counter
            timeIntervalId = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);

            // Poll every 3 seconds
            intervalId = setInterval(async () => {
                setAttempts(prev => prev + 1);
                const isUp = await checkServerHealth();

                if (isUp) {
                    setIsOnline(true);
                    clearInterval(intervalId);
                    clearInterval(timeIntervalId);
                }
            }, 3000);

            // Max 20 attempts (60 seconds)
            setTimeout(() => {
                if (intervalId) clearInterval(intervalId);
                if (timeIntervalId) clearInterval(timeIntervalId);
            }, 60000);
        };

        startChecking();

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (timeIntervalId) clearInterval(timeIntervalId);
        };
    }, []);

    return (
        <ServerStatusContext.Provider value={{ isOnline, attempts, elapsedTime }}>
            {children}
        </ServerStatusContext.Provider>
    );
}
