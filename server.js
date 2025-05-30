require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Route modules
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Add cookie parser
app.use(cookieParser());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced MongoDB connection with error handling
const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://remoteworker-nine.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-auth-token'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Root endpoint handler
app.get('/', (req, res) => {
  res.json({
    status: 'active',
    message: 'Remote Worker API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      api_docs: '/api',
      auth: '/api/auth',
      admin: '/api/admin',
      users: '/api/users'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'active',
    message: 'API Documentation',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      users: {
        profile: 'GET /api/users/profile',
        messages: 'GET /api/users/messages'
      },
      tasks: 'GET /api/tasks',
      wallet: 'GET /api/wallet',
      admin: {
        users: 'GET /api/admin/users',
        tasks: 'GET/POST /api/admin/tasks'
      }
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl,
    suggestion: 'Check /api for available endpoints'
  });
});

// General 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: ['/', '/api', '/api/auth', '/api/admin']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // MongoDB connection error
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection error',
      action: 'Retrying connection...'
    });
  }
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'Cross-origin request blocked',
      allowedOrigins
    });
  }
  
  // General error response
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Graceful shutdown
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Export app for Vercel
module.exports = app;