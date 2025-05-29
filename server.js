// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// route modules
const authRoutes  = require('./routes/authRoutes');
const userRoutes  = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes  = require('./routes/taskRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// mount API routes under /api
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

// catch-all 404 for anything else
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// export app (no app.listen)
module.exports = app;
