// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route modules
const authRoutes      = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes      = require('./routes/userRoutes');
const taskRoutes      = require('./routes/taskRoutes');
const walletRoutes    = require('./routes/walletRoutes');
const adminRoutes     = require('./routes/adminRoutes');

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Mount API routes
app.use('/api/auth',       authRoutes);       // user signup/login
app.use('/api/admin/auth', adminAuthRoutes);  // admin login
app.use('/api/users',      userRoutes);       // user profile & messages
app.use('/api/tasks',      taskRoutes);       // task listing, start, attempt
app.use('/api/wallet',     walletRoutes);     // wallet & withdrawals
app.use('/api/admin',      adminRoutes);      // admin panel CRUD

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Export app for Vercel (no app.listen here)
module.exports = app;
