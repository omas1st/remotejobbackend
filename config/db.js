const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,  // 10-second timeout
      socketTimeoutMS: 45000,           // 45-second socket timeout
      maxPoolSize: 10,                  // Maximum connection pool size
      minPoolSize: 2,                   // Minimum connection pool size
      heartbeatFrequencyMS: 30000       // Send heartbeat every 30s
    });
    
    console.log('MongoDB connected successfully');
    
    // Event listeners for connection monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from DB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (err) {
    console.error('MongoDB initial connection failed:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);  // Auto-retry every 5 seconds
  }
};

module.exports = connectDB;