// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Session expired or not authenticated.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, profileType?, isAdmin? }
    next();
  } catch (err) {
    // JWT expired or invalid
    return res.status(401).json({ message: 'Session expired or not authenticated.' });
  }
};

/*
  ── NOTE ON SESSION DURATION ──
  Your token’s TTL is set when you call `jwt.sign(…)` in your auth/login controller.
  For example:
    jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }    // ← bump this to '7d', '30d', etc.
    );
  If you send me that login file, I can adjust it for you.
*/
