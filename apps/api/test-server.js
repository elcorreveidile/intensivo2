const express = require('express');
const app = express();
const PORT = 4000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
});
