/**
 * API Service Layer
 * Centralized API calls to backend
 */

import axios from 'axios';

const API_BASE_URL = 'https://winzone-final.onrender.com/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verify: () => api.get('/auth/verify'),
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getStats: () => api.get('/users/stats'),
    getGameStats: (gameId) => api.get(`/users/stats/${gameId}`),
    getActivity: (params) => api.get('/users/activity', { params }),
};

// Wallet APIs
export const walletAPI = {
    getBalance: () => api.get('/wallet/balance'),
    requestBalance: (amount) => api.post('/wallet/request', { amount }),
    getRequests: () => api.get('/wallet/requests'),
};

// Game APIs
export const gameAPI = {
    getGames: () => api.get('/games'),
    getGame: (gameId) => api.get(`/games/${gameId}`),
    getGameState: (gameId) => api.get(`/games/${gameId}/state`),
};

// Admin APIs
export const adminAPI = {
    getGames: () => api.get('/admin/games'),
    toggleGame: (gameId, enabled) => api.put(`/admin/games/${gameId}/toggle`, { enabled }),
    updateGameConfig: (gameId, data) => api.put(`/admin/games/${gameId}/config`, data),
    getWalletRequests: () => api.get('/admin/wallet/requests'),
    getWalletHistory: () => api.get('/admin/wallet/history'),
    approveRequest: (requestId, notes) => api.post(`/admin/wallet/approve/${requestId}`, { notes }),
    rejectRequest: (requestId, notes) => api.post(`/admin/wallet/reject/${requestId}`, { notes }),
    getUsers: () => api.get('/admin/users'),
    updateUserBalance: (userId, amount, reason) => api.post(`/admin/users/${userId}/balance`, { amount, reason }),
    updateUserStatus: (userId, banned) => api.put(`/admin/users/${userId}/status`, { banned }),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),
    getStats: () => api.get('/admin/stats'),
    // Aviator admin
    createSchedule: (data) => api.post('/admin/aviator/schedule', data),
    getSchedules: (params) => api.get('/admin/aviator/schedules', { params }),
    deleteSchedule: (scheduleId) => api.delete(`/admin/aviator/schedules/${scheduleId}`),
    getRounds: (params) => api.get('/admin/aviator/rounds', { params }),
};

export default api;
