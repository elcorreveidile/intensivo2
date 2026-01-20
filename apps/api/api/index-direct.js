// ULTRA-SIMPLE CORS SERVER - NO DEPENDENCIES ON BUILD
// This is the absolute simplest possible implementation
console.log('='.repeat(80));
console.log('[DIRECT API] Starting ultra-simple CORS-enabled server');
console.log('[DIRECT API] Node version:', process.version);
console.log('[DIRECT API] Time:', new Date().toISOString());
console.log('='.repeat(80));

const express = require('express');
const app = express();

// CORS - THE ONLY THING THAT MATTERS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(`>>> ${req.method} ${req.url} from ${origin || 'no-origin'}`);

  // Set CORS headers for EVERYONE
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OPTIONS? Done. Return immediately.
  if (req.method === 'OPTIONS') {
    console.log('>>> OPTIONS handled - returning 204');
    return res.status(204).end();
  }

  next();
});

// Body parsing
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('>>> Health check');
  res.json({
    status: 'ok',
    message: 'Ultra-simple CORS server is working',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    note: 'This is a minimal server to fix CORS. Full API routes coming soon.'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Aula Virtual API - Direct Mode',
    status: 'CORS is working',
    version: '1.0.0-direct',
    timestamp: new Date().toISOString()
  });
});

// Catch all
app.all('*', (req, res) => {
  console.log(`>>> ${req.method} ${req.url} - using placeholder`);
  res.status(200).json({
    message: 'CORS is working!',
    received: {
      method: req.method,
      path: req.url,
      origin: req.headers.origin
    },
    note: 'This is a minimal CORS server. The OPTIONS preflight should work now.',
    nextStep: 'Once CORS is confirmed working, we will enable full API routes.'
  });
});

console.log('[DIRECT API] Server ready - all requests will have CORS headers');
console.log('='.repeat(80));

module.exports = app;
