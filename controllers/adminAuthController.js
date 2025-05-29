const jwt = require('jsonwebtoken');
const emailNotifier = require('../utils/emailNotifier');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail || password !== adminPass) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  await emailNotifier('Admin Login', `Admin logged in with email ${email}`);

  const token = jwt.sign(
    { isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ token, isAdmin: true });
};