// backend/controllers/adminAuthController.js
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

  await emailNotifier(
    'Admin Login',
    `Admin logged in with email ${email}`
  );

  const token = jwt.sign(
    { isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
};
