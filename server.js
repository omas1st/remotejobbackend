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

// ─── Safe helper to mount router modules ────────────────────────────────────
function safeMount(prefix, modulePath) {
  try {
    const router = require(modulePath);
    app.use(prefix, router);
    console.log(`Mounted ${prefix} → ${modulePath}`);
  } catch (err) {
    console.error(`❌ Failed to mount [${prefix}] from "${modulePath}":`, err.message);
    // Optionally log full stack:
    // console.error(err);
  }
}

// ─── Mount each route inside a try/catch ─────────────────────────────────────
safeMount('/api/auth',       './routes/authRoutes');
safeMount('/api/admin/auth', './routes/adminAuthRoutes');
safeMount('/api/users',      './routes/userRoutes');
safeMount('/api/tasks',      './routes/taskRoutes');
safeMount('/api/wallet',     './routes/walletRoutes');
safeMount('/api/admin',      './routes/adminRoutes');

// ─── Production: serve React build; catch-all to index.html ────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend', 'build');
  try {
    app.use(express.static(buildPath));
    app.get('*', (req, res) =>
      res.sendFile(path.join(buildPath, 'index.html'))
    );
    console.log(`✔️  Serving React from "${buildPath}"`);
  } catch (err) {
    console.error(`❌ Failed to serve static build at "${buildPath}":`, err.message);
  }
} else {
  app.get('/', (_req, res) => res.send('API is running'));
}

// ─── Only start a real HTTP server if not on Vercel ─────────────────────────
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ─── Export the Express app so Vercel can invoke it without spinning up a new server ─────
module.exports = app;
