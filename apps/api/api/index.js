console.log('[API] Loading entry point...');
console.log('[API] Node version:', process.version);
console.log('[API] Working directory:', process.cwd());
console.log('[API] __dirname:', __dirname);

try {
  console.log('[API] Attempting to require dist/index.js...');
  const app = require('../dist/index').default;

  if (!app) {
    throw new Error('App export is undefined');
  }

  console.log('[API] App loaded successfully, type:', typeof app);
  console.log('[API] App has listen method:', typeof app.listen === 'function');

  module.exports = app;
} catch (error) {
  console.error('='.repeat(80));
  console.error('[API] CRITICAL ERROR: Failed to load app');
  console.error('[API] Error message:', error.message);
  console.error('[API] Error stack:', error.stack);
  console.error('[API] Current directory contents:');

  try {
    const fs = require('fs');
    const path = require('path');
    const distPath = path.join(__dirname, '..', 'dist');
    console.error('[API] Checking dist directory:', distPath);
    if (fs.existsSync(distPath)) {
      console.error('[API] dist/ directory exists');
      const files = fs.readdirSync(distPath);
      console.error('[API] Files in dist/:', files);
    } else {
      console.error('[API] dist/ directory DOES NOT EXIST');
    }
  } catch (fsError) {
    console.error('[API] Error checking filesystem:', fsError.message);
  }

  console.error('='.repeat(80));

  // Create emergency CORS-enabled error handler
  const express = require('express');
  const errorApp = express();

  // CRITICAL: Add CORS middleware FIRST
  errorApp.use((req, res, next) => {
    const origin = req.headers.origin;
    console.error(`[ERROR APP] ${req.method} ${req.path} from origin:`, origin);

    // Allow all origins in error mode
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS immediately
    if (req.method === 'OPTIONS') {
      console.error('[ERROR APP] Responding to OPTIONS with 204');
      return res.status(204).end();
    }

    next();
  });

  // Error response for all other requests
  errorApp.use((req, res) => {
    res.status(500).json({
      error: 'Failed to load app - Build may have failed',
      message: error.message,
      hint: 'Check Vercel build logs for TypeScript compilation errors',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });

  console.error('[API] Exporting emergency error handler app');
  module.exports = errorApp;
}
