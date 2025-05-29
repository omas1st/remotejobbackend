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

// ——————————————
// Mount your API routes
// ——————————————
app.use('/api/auth',        require('./routes/authRoutes'));       // user login/register
app.use('/api/admin/auth',  require('./routes/adminAuthRoutes'));  // admin login
app.use('/api/users',       require('./routes/userRoutes'));       // user profile, messages
app.use('/api/tasks',       require('./routes/taskRoutes'));       // tasks start/attempt
app.use('/api/wallet',      require('./routes/walletRoutes'));     // wallet & withdraw
app.use('/api/admin',       require('./routes/adminRoutes'));      // admin panel CRUD

// ——————————————
// Static assets & client fallback
// ——————————————
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    // Serve React’s index.html for any non-API route
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Health check / development root
  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });
}

// ——————————————
// Server start (only if run directly)
// ——————————————
if (require.main === module) {
  // Not running as a Vercel serverless function
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ——————————————
// Export for Vercel or tests
// ——————————————
module.exports = app;
