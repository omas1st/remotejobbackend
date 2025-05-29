const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Check multiple token locations
  const token = req.header('x-auth-token') || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token, auth denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token not valid' });
  }
};