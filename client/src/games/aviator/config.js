/**
 * Aviator Game Configuration
 * Connects to backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const WSS_URL = process.env.NEXT_PUBLIC_WSS_URL || 'http://localhost:5001';

export const config = {
  development: process.env.NODE_ENV === 'development',
  debug: true,
  appKey: "crash-0.1.0",
  api: API_URL,
  wss: WSS_URL,
};


