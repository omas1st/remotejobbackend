// server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Mount your API routes ───────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/admin/auth', require('./routes/adminAuthRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/tasks',      require('./routes/taskRoutes'));
app.use('/api/wallet',     require('./routes/walletRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

// ─── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));

  // Catch-all to serve index.html
  app.get('*', (req, res) =>
    res.sendFile(path.join(buildPath, 'index.html'))
  );
} else {
  app.get('/', (_req, res) => res.send('API is running'));
}

// ─── Start HTTP server when running locally ──────────────────────────────────
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ─── Export Express app for Vercel ───────────────────────────────────────────
module.exports = app;
