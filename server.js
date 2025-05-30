// backend/server.js
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

// Mount your routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/auth', require('./routes/adminAuthRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Remove socket.io from Vercel environment
if (process.env.VERCEL !== '1') {
  const http = require('http');
  const socketio = require('socket.io');
  const server = http.createServer(app);
  const io = new socketio.Server(server, {
    cors: { origin: '*' }
  });
  app.locals.io = io;
  
  // Start server only in non-Vercel environments
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Vercel-specific configuration
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running'));
}

// Export for Vercel serverless
module.exports = app;