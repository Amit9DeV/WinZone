// Import config from JSON file
import configJson from './config.json';

// Determine if we're in development mode
const isDevelopment = configJson.development !== false; // Default to true if not specified

export const config = {
  development: isDevelopment,
  debug: configJson.debug !== false,
  appKey: configJson.appKey || "crash-0.1.0",
  api: isDevelopment ? configJson.development_api : configJson.production_api,
  wss: isDevelopment ? configJson.development_wss : configJson.production_wss,
};

// Fallback to environment variables if JSON values are missing
if (process.env.REACT_APP_API_URL) {
  config.api = `${process.env.REACT_APP_API_URL}/api`;
  config.wss = process.env.REACT_APP_API_URL;
}

// Ensure wss is set (critical for Socket.IO)
if (!config.wss) {
  config.wss = 'https://winzone-final.onrender.com';
  console.warn('⚠️ WebSocket URL not configured, using default: https://winzone-final.onrender.com');
}

console.log('🔧 Config loaded:', {
  development: config.development,
  wss: config.wss,
  api: config.api,
});
