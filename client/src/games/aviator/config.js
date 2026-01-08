/**
 * Aviator Game Configuration
 * Connects to backend API
 */

const API_URL = 'https://winzone-final.onrender.com/api';
const WSS_URL = 'https://winzone-final.onrender.com';

export const config = {
  development: process.env.NODE_ENV === 'development',
  debug: true,
  appKey: "crash-0.1.0",
  api: API_URL,
  wss: WSS_URL,
};


