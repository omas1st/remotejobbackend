// backend/controllers/adminAuthController.js
const jwt = require('jsonwebtoken');
const emailNotifier = require('../utils/emailNotifier');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;

  // Simple credential check
  if (email !== adminEmail || password !== adminPass) {
    return res.status(401).json({ status: 'error', message: 'Invalid admin credentials' });
  }

  // Notify on admin login (non-blocking)
  emailNotifier('Admin Login', `Admin logged in with email ${email}`)
    .catch(err => console.error('Admin emailNotifier failed:', err));

  // Include an ID in the payload for future use
  const payload = { id: email, isAdmin: true };

  // Sign with a longer expiry (30 days)
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Send as HTTP-only secure cookie plus JSON body
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.json({ status: 'success', token, isAdmin: true });
};
