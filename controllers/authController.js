const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');
require('dotenv').config();

exports.register = async (req, res) => {
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

  try {
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !gender || !country) {
      return res.status(400).json({ 
        status: 'error',
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    // Send registration notification
    await emailNotifier(
      'New User Registration',
      `New ${profileType} registered: ${firstName} ${lastName} (${email})`
    );

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Always secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'none', // Required for cross-site
      domain: process.env.COOKIE_DOMAIN || '.vercel.app'
    });

    // Return success response
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
    console.error('Registration Error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Send login notification
    await emailNotifier(
      'User Login',
      `${user.profileType} logged in: ${user.firstName} ${user.lastName} (${email})`
    );

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Always secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'none', // Required for cross-site
      domain: process.env.COOKIE_DOMAIN || '.vercel.app'
    });

    // Return success response
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
    console.error('Login Error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }
    res.json({
      status: 'success',
      user
    });
  } catch (err) {
    console.error('GetMe Error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error' 
    });
  }
};