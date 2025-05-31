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

// ─── Mount your API routes (use exact paths under backend/routes) ───────────
app.use('/api/auth',       require('./backend/routes/authRoutes'));
app.use('/api/admin/auth', require('./backend/routes/adminAuthRoutes'));
app.use('/api/users',      require('./backend/routes/userRoutes'));
app.use('/api/tasks',      require('./backend/routes/taskRoutes'));
app.use('/api/wallet',     require('./backend/routes/walletRoutes'));
app.use('/api/admin',      require('./backend/routes/adminRoutes'));

// ─── If in production, serve the React build folder ─────────────────────────
if (process.env.NODE_ENV === 'production') {
  // NOTE: Adjust this path if your frontend build actually lives somewhere else.
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));

  // Catch-all: send index.html for any route NOT handled above
  app.get('*', (req, res) =>
    res.sendFile(path.join(buildPath, 'index.html'))
  );
} else {
  // In dev, just confirm the API is alive if you load “/”
  app.get('/', (_req, res) => res.send('API is running'));
}

// ─── Only start a local HTTP server when NOT on Vercel ───────────────────────
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ─── Export the Express application for Vercel to invoke as a Serverless Function ───
module.exports = app;
