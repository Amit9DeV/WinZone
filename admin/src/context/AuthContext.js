'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, walletAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await authAPI.verify();
            if (response.data.success) {
                const userData = response.data.data.user;
                setUser(userData);
                // Also store in localStorage for consistency
                localStorage.setItem('user', JSON.stringify(userData));
                await fetchBalance();
            } else {
                // If verify fails, try to get user from localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                    } catch (e) {
                        console.error('Failed to parse stored user:', e);
                    }
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await walletAPI.getBalance();
            if (response.data.success) {
                setBalance(response.data.data.balance);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setBalance(user.balance);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setBalance(0);
        router.push('/login');
    };

    const updateBalance = (newBalance) => {
        setBalance(newBalance);
    };

    const value = {
        user,
        balance,
        loading,
        login,
        logout,
        updateBalance,
        fetchBalance,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
