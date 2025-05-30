const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');
require('dotenv').config();

exports.register = async (req, res) => {
  console.log('Received registration request:', req.body);
  
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
      console.log('Missing fields in registration');
      return res.status(400).json({ 
        status: 'error',
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: Email already exists (${email})`);
      return res.status(400).json({ 
        status: 'error',
        message: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

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

    console.log(`User created: ${user.email}`);

    // Send registration notification
    try {
      await emailNotifier(
        'New User Registration',
        `New ${profileType} registered: ${firstName} ${lastName} (${email})`
      );
      console.log('Registration email sent');
    } catch (emailErr) {
      console.error('Failed to send registration email:', emailErr);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated');

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
    
    let errorMessage = 'Registration failed';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    res.status(500).json({ 
      status: 'error',
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  console.log('Received login request:', req.body);
  
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password in login');
      return res.status(400).json({ 
        status: 'error',
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User not found (${email})`);
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Send login notification
    try {
      await emailNotifier(
        'User Login',
        `${user.profileType} logged in: ${user.firstName} ${user.lastName} (${email})`
      );
      console.log('Login notification email sent');
    } catch (emailErr) {
      console.error('Failed to send login email:', emailErr);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful, token generated');

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