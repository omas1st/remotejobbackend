const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const auth = require('../middleware/auth');
const {
  resetPassword,
  contactSales,
  getMessages,
  contactAdmin
} = require('../controllers/userController');

router.post('/reset-password', resetPassword);
router.post('/contact-sales', auth, upload.single('file'), contactSales);
router.get('/messages', auth, getMessages);
router.post('/contact-admin', auth, upload.single('file'), contactAdmin);

module.exports = router;
