'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI, userAPI, walletAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

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

  const register = async (name, email, password, referralCode) => {
    try {
      const response = await authAPI.register({ name, email, password, referralCode });
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
        message: error.response?.data?.message || 'Registration failed',
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

  // WebSocket Connection
  useEffect(() => {
    let socket;

    if (user) {
      const userId = user._id || user.id;

      if (userId) {
        // Define socket URL based on environment or fallback to localhost:5001
        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'https://winzone-final.onrender.com';

        console.log('🔌 Initializing Socket.IO connection to:', SOCKET_URL, 'for User:', userId);

        socket = io(SOCKET_URL, {
          query: { userId: userId },
          transports: ['websocket', 'polling'], // Try websocket first
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          console.log('✅ Socket connected successfully:', socket.id);
          // Auto-fetch balance on connect to ensure sync
          fetchBalance();
        });

        socket.on('connect_error', (err) => {
          console.error('❌ Socket connection error:', err.message);
        });

        socket.on('user:balance', (newBalance) => {
          console.log('💰 WebSocket Balance Update:', newBalance);
          setBalance(newBalance);
        });

        socket.on('disconnect', (reason) => {
          console.warn('⚠️ Socket disconnected:', reason);
        });
      }
    }

    return () => {
      if (socket) {
        console.log('🔌 Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [user]);

  const updateBalance = useCallback((newBalance) => {
    setBalance(newBalance);
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    balance,
    loading,
    login,
    register,
    logout,
    updateBalance,
    fetchBalance,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  }), [user, balance, loading, updateBalance]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

