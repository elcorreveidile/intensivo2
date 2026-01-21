// Standalone CORS-enabled Express server for Vercel
// This file is completely self-contained and doesn't require TypeScript compilation
console.log('[SIMPLE API] Starting standalone server... Built:', new Date().toISOString());
console.log('[SIMPLE API] Deployment timestamp:', new Date().toISOString());

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

console.log('[SIMPLE API] Environment:', process.env.NODE_ENV || 'production');

// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  if (origin.includes('aula-virtual') && origin.includes('vercel.app')) return true;
  if (origin.includes('intensivo2') && origin.includes('vercel.app')) return true;
  if (origin === 'https://intensivo2-swart.vercel.app') return true;
  if (origin === process.env.FRONTEND_URL) return true;
  return false;
};

// CRITICAL: CORS middleware FIRST - before everything else
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(`[SIMPLE API] ${req.method} ${req.path} from origin: ${origin || 'no-origin'}`);

  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '600');

    // Handle OPTIONS preflight immediately
    if (req.method === 'OPTIONS') {
      console.log('[SIMPLE API] ✅ Responding to OPTIONS with 204');
      return res.status(204).end();
    }
  } else if (origin) {
    console.log('[SIMPLE API] ❌ Origin blocked:', origin);
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

console.log('[SIMPLE API] Middleware configured');

// Try to load compiled routes, but continue if it fails
let routesLoaded = false;
let loadError = null;
try {
  console.log('[SIMPLE API] Attempting to load compiled routes...');

  // Try loading from dist using absolute path
  const path = require('path');
  const distPath = path.join(__dirname, '../../dist/routes');

  console.log('[SIMPLE API] Looking for routes in:', distPath);
  console.log('[SIMPLE API] __dirname:', __dirname);

  const authRoutes = require(path.join(distPath, 'auth.routes.js')).default;
  const coursesRoutes = require(path.join(distPath, 'courses.routes.js')).default;
  const assignmentsRoutes = require(path.join(distPath, 'assignments.routes.js')).default;
  const submissionsRoutes = require(path.join(distPath, 'submissions.routes.js')).default;
  const feedbackRoutes = require(path.join(distPath, 'feedback.routes.js')).default;

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api', assignmentsRoutes);
  app.use('/api', submissionsRoutes);
  app.use('/api', feedbackRoutes);

  routesLoaded = true;
  console.log('[SIMPLE API] ✅ Compiled routes loaded successfully');
} catch (error) {
  loadError = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    path: error.path
  };
  console.error('[SIMPLE API] ⚠️  Could not load compiled routes:', error.message);
  console.error('[SIMPLE API] Stack:', error.stack);
  console.error('[SIMPLE API] Loading Firebase auth routes...');

  // Load Firebase auth handlers
  const { register, login, getMe } = require('./auth-firebase');

  // Register endpoints
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.get('/api/auth/me', getMe);

  console.log('[SIMPLE API] ✅ Firebase auth routes loaded');
}

// Fallback/info routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Aula Virtual API',
    mode: routesLoaded ? 'full' : 'fallback',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    debug: {
      commit: 'ffb54ec',
      routesLoaded,
      distPath: routesLoaded ? 'loaded' : 'failed'
    }
  });
});

// Test endpoint to verify deployment
app.get('/test-deployment', (req, res) => {
  const path = require('path');
  const fs = require('fs');

  // Check if dist files exist
  const distPath = path.join(__dirname, '../../dist/routes');
  let distFilesExist = false;
  let fileList = [];

  try {
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      distFilesExist = true;
      fileList = files.filter(f => f.endsWith('.js') && !f.endsWith('.map'));
    }
  } catch (e) {
    fileList = [`Error: ${e.message}`];
  }

  res.json({
    message: 'If you see this, the latest code is deployed',
    commit: 'b4743ae',
    timestamp: new Date().toISOString(),
    files: {
      indexSimple: 'loaded',
      distRoutes: routesLoaded
    },
    debug: {
      __dirname,
      distPath,
      distFilesExist,
      fileList,
      routesLoaded,
      loadError: loadError ? {
        message: loadError.message,
        code: loadError.code,
        path: loadError.path
      } : null
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Aula Virtual CLMABROAD API',
    version: '1.0.0',
    mode: routesLoaded ? 'full' : 'javascript-fallback',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[SIMPLE API] Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    path: req.path
  });
});

console.log('[SIMPLE API] ✅ Server configured and ready');

module.exports = app;

