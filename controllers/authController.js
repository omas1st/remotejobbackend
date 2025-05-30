// backend/controllers/authController.js
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
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
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

    await emailNotifier(
      'New User Registration',
      `New ${profileType} registered: ${firstName} ${lastName} (${email})`
    );

    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await emailNotifier(
      'User Login',
      `${user.profileType} logged in: ${user.firstName} ${user.lastName} (${email})`
    );

    const token = jwt.sign(
      { id: user._id, profileType: user.profileType, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
