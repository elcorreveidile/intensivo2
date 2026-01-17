console.log('[API] Loading entry point...');
try {
  console.log('[API] Requiring dist/index.js...');
  const app = require('../dist/index').default;
  console.log('[API] App loaded successfully:', typeof app);
  module.exports = app;
} catch (error) {
  console.error('[API] Error loading app:', error);
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Failed to load app',
      message: error.message,
      stack: error.stack 
    });
  };
}
