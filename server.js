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

/**
 * Helper: Safely mount a router module.
 * If the required file throws (e.g., due to a bad route pattern),
 * we catch it, log the error, and keep running.
 */
function safeMount(prefix, modulePath) {
  try {
    const router = require(modulePath);
    app.use(prefix, router);
    console.log(`✔️ Mounted ${prefix} → ${modulePath}`);
  } catch (err) {
    console.error(`❌ Failed to mount [${prefix}] from "${modulePath}":`, err.message);
  }
}

// ── Mount each route in a try/catch so a malformed route won’t crash everything ──
safeMount('/api/auth',       './routes/authRoutes');
safeMount('/api/admin/auth', './routes/adminAuthRoutes');
safeMount('/api/users',      './routes/userRoutes');
safeMount('/api/tasks',      './routes/taskRoutes');
safeMount('/api/wallet',     './routes/walletRoutes');
safeMount('/api/admin',      './routes/adminRoutes');

// ── Respond to GET /api so it doesn’t return 404 in production ─────────────────
app.get('/api', (_req, res) => res.send('API is running'));

// ── Always respond to GET / with a simple message ─────────────────────────────
app.get('/', (_req, res) => res.send('API is running'));

// ── When running locally (i.e. not on Vercel), start an HTTP server ──────────
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ── Export the Express app so that Vercel can spin it up as a Serverless Function ──
module.exports = app;
