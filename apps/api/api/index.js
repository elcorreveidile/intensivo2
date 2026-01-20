console.log('[API] Loading entry point...');
console.log('[API] Node version:', process.version);
console.log('[API] Working directory:', process.cwd());

// Try loading the simple JS version first (doesn't require TypeScript build)
try {
  console.log('[API] Attempting to load index-simple.js...');
  const simpleApp = require('./index-simple');

  if (!simpleApp) {
    throw new Error('Simple app export is undefined');
  }

  console.log('[API] ✅ Simple app loaded successfully');
  module.exports = simpleApp;
} catch (simpleError) {
  console.error('[API] ❌ Failed to load simple app:', simpleError.message);

  // Fallback to compiled TypeScript version
  try {
    console.log('[API] Attempting to require dist/index.js...');
    const app = require('../dist/index').default;

    if (!app) {
      throw new Error('App export is undefined');
    }

    console.log('[API] ✅ Compiled app loaded successfully');
    module.exports = app;
  } catch (error) {
    console.error('='.repeat(80));
    console.error('[API] ❌ CRITICAL ERROR: Failed to load any app version');
    console.error('[API] Error:', error.message);
    console.error('='.repeat(80));

    // Last resort: inline emergency handler
    const express = require('express');
    const emergencyApp = express();

    // CORS middleware
    emergencyApp.use((req, res, next) => {
      const origin = req.headers.origin;
      console.error(`[EMERGENCY] ${req.method} ${req.path} from:`, origin);

      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') {
        console.error('[EMERGENCY] Responding to OPTIONS with 204');
        return res.status(204).end();
      }

      next();
    });

    emergencyApp.use((req, res) => {
      res.status(500).json({
        error: 'All app versions failed to load',
        message: error.message,
        hint: 'Check Vercel build logs and ensure dependencies are installed'
      });
    });

    console.error('[API] Exporting emergency handler');
    module.exports = emergencyApp;
  }
}
