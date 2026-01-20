// ENTRY POINT FOR VERCEL - ULTRA SIMPLE VERSION
// Using the simplest possible CORS implementation to fix the 500 error
console.log('[VERCEL ENTRY] Loading...');

try {
  const app = require('./index-direct');
  console.log('[VERCEL ENTRY] ✅ Direct app loaded');
  module.exports = app;
} catch (error) {
  console.error('[VERCEL ENTRY] ❌ Failed to load:', error);
  throw error;
}
