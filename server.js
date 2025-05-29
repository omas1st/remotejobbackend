// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// route modules
const authRoutes      = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes      = require('./routes/userRoutes');
const adminRoutes     = require('./routes/adminRoutes');
const taskRoutes      = require('./routes/taskRoutes');
const walletRoutes    = require('./routes/walletRoutes');

const app = express();

// ——————————————
// Middleware
// ——————————————
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ——————————————
// Root health check
// ——————————————
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// ——————————————
// MongoDB Connection
// ——————————————
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ——————————————
// Mount API Routes
// ——————————————
app.use('/api/auth',        authRoutes);        // user login/register
app.use('/api/admin/auth',  adminAuthRoutes);   // admin login
app.use('/api/users',       userRoutes);        // user profile, messages
app.use('/api/tasks',       taskRoutes);        // task start/attempt
app.use('/api/wallet',      walletRoutes);      // wallet & withdraw
app.use('/api/admin',       adminRoutes);       // admin panel

// ——————————————
// 404 catch-all
// ——————————————
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ——————————————
// Export for Vercel
// ——————————————
module.exports = app;
