// backend/routes/walletRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const { getWallet, requestWithdraw } = require('../controllers/walletController');
const router = express.Router();

router.get('/', auth, getWallet);
router.post('/withdraw', auth, requestWithdraw);

module.exports = router;
