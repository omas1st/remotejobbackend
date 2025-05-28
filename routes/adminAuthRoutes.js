// backend/routes/adminAuthRoutes.js
const express = require('express');
const { login } = require('../controllers/adminAuthController');
const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', login);

module.exports = router;
