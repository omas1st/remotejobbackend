// backend/routes/userRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  contactAdmin,
  getMessages,
  verifyWithdrawalPin,
  getUserPaymentUrls
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/message-admin', auth, contactAdmin);
router.get('/messages', auth, getMessages);
router.post('/verify-pin', auth, verifyWithdrawalPin);

// New: fetch payment URLs for this user
router.get('/payment-url', auth, getUserPaymentUrls);

module.exports = router;
