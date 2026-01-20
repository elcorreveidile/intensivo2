// ENTRY POINT FOR VERCEL
console.log('[API] Entry point loading...');

try {
  // Try simple app first (best CORS implementation)
  const app = require('./index-simple');
  console.log('[API] ✅ Simple app loaded');
  module.exports = app;
} catch (error) {
  console.error('[API] ❌ Failed to load simple app:', error.message);

  // Last resort - inline minimal CORS server
  console.log('[API] Creating emergency inline server...');
  const express = require('express');
  const emergencyApp = express();

  // CORS middleware
  emergencyApp.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`[EMERGENCY] ${req.method} ${req.url} from ${origin || 'no-origin'}`);

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      console.log('[EMERGENCY] OPTIONS handled - 204');
      return res.status(204).end();
    }

    next();
  });

  emergencyApp.use(express.json());

  emergencyApp.get('/health', (req, res) => {
    res.json({
      status: 'emergency',
      message: 'Emergency CORS server active',
      error: error.message
    });
  });

  emergencyApp.all('*', (req, res) => {
    res.status(503).json({
      error: 'Server failed to load',
      message: error.message,
      hint: 'Check dependencies are installed'
    });
  });

  console.log('[API] Emergency server created');
  module.exports = emergencyApp;
}
