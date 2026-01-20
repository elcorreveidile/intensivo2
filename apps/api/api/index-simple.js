// Simple CORS-enabled Express server for Vercel
// This file doesn't require TypeScript compilation
console.log('[SIMPLE API] Starting...');

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

console.log('[SIMPLE API] Configuring CORS...');

// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  if (origin.includes('aula-virtual') && origin.includes('vercel.app')) return true;
  if (origin.includes('intensivo2') && origin.includes('vercel.app')) return true;
  if (origin === process.env.FRONTEND_URL) return true;
  return false;
};

// CRITICAL: CORS middleware FIRST
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(`[CORS] ${req.method} ${req.path} from origin: ${origin}`);

  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '600');

    // Handle OPTIONS preflight immediately
    if (req.method === 'OPTIONS') {
      console.log('[CORS] Responding to OPTIONS with 204');
      return res.status(204).end();
    }
  } else if (origin) {
    console.log('[CORS] Origin blocked:', origin);
    if (req.method === 'OPTIONS') {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }

  next();
});

// Other middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Try to load the compiled app, fallback to simple endpoints
let compiledApp;
try {
  compiledApp = require('../dist/index').default;
  console.log('[SIMPLE API] Compiled app loaded, delegating requests');

  // Delegate all routes to compiled app
  app.use((req, res, next) => {
    compiledApp(req, res, next);
  });
} catch (error) {
  console.error('[SIMPLE API] Could not load compiled app:', error.message);
  console.error('[SIMPLE API] Using fallback routes');

  // Fallback routes
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Aula Virtual API (Fallback Mode)',
      timestamp: new Date().toISOString()
    });
  });

  app.all('*', (req, res) => {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'TypeScript compilation failed. Please check build logs.',
      hint: 'This is the fallback server with CORS enabled.',
      method: req.method,
      path: req.path
    });
  });
}

console.log('[SIMPLE API] Server configured and ready');

module.exports = app;
