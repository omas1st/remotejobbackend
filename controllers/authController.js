const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');
require('dotenv').config();

// Set global timeout for auth operations
const AUTH_TIMEOUT = 30000; // 30 seconds

exports.register = async (req, res) => {
  // Set timeout for registration
  const timeout = setTimeout(() => {
    return res.status(504).json({ 
      status: 'error',
      message: 'Registration timed out' 
    });
  }, AUTH_TIMEOUT);

  try {
    const {
      profileType,
      firstName,
      lastName,
      email,
      phone,
      gender,
      country,
      password
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !gender || !country) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        status: 'error',
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).maxTimeMS(10000);
    if (existingUser) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        status: 'error',
        message: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      profileType,
      firstName,
      lastName,
      email,
      phone,
      gender,
      country,
      password: hashed
    });

    // Send registration notification (async)
    emailNotifier(
      'New User Registration',
      `New ${profileType} registered: ${firstName} ${lastName} (${email})`
    ).catch(console.error);

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    clearTimeout(timeout);
    res.status(201).json({ 
      status: 'success',
      token, 
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileType: user.profileType
      }
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error('Registration Error:', err);
    
    let errorMessage = 'Registration failed';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    res.status(500).json({ 
      status: 'error',
      message: errorMessage
    });
  }
};

exports.login = async (req, res) => {
  // Set timeout for login
  const timeout = setTimeout(() => {
    return res.status(504).json({ 
      status: 'error',
      message: 'Login timed out' 
    });
  }, AUTH_TIMEOUT);

  const { email, password } = req.body;
  
  try {
    // Find user by email with timeout
    const user = await User.findOne({ email }).maxTimeMS(10000);
    if (!user) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      clearTimeout(timeout);
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send login notification (async)
    emailNotifier(
      'User Login',
      `${user.profileType} logged in: ${user.firstName} ${user.lastName} (${email})`
    ).catch(console.error);

    clearTimeout(timeout);
    res.json({ 
      status: 'success',
      token, 
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileType: user.profileType
      }
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error('Login Error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Login failed'
    });
  }
};

// Keep session alive endpoint
exports.keepAlive = async (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Session extended' 
  });
};