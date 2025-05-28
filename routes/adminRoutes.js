// backend/routes/adminRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ctrl = require('../controllers/adminController');

const router = express.Router();

// Use a cross-platform temp directory (writable on Vercel and locally)
const uploadDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer to store uploads in that temp directory
const upload = multer({ dest: uploadDir });

// 1. Users Profile
router.get('/users', auth, admin, ctrl.getAllUsers);

// 2. Message Page (with optional file)
router.post(
  '/message',
  auth,
  admin,
  upload.single('file'),
  ctrl.sendMessageToUser
);

// 3. Wallet Page
router.post('/wallet', auth, admin, ctrl.editWalletBalance);

// 4. Verify Withdrawal PIN
router.post('/verify-pin', auth, admin, ctrl.setVerifyPin);

// 5. Tasks Page
router.get('/tasks', auth, admin, ctrl.getAllTasks);
router.post('/tasks', auth, admin, ctrl.createTask);
router.put('/tasks/:id', auth, admin, ctrl.updateTask);
router.delete('/tasks/:id', auth, admin, ctrl.deleteTask);

// 6. Payment URL Page
router.post('/payment-url', auth, admin, ctrl.setPaymentUrl);
router.get('/payment-url', auth, admin, ctrl.getPaymentUrls);

// 7. Task Payment Approval
router.get(
  '/task-submissions',
  auth,
  admin,
  ctrl.getTaskSubmissions
);
router.post(
  '/approve-submission/:submissionId',
  auth,
  admin,
  ctrl.approveSubmission
);
router.delete(
  '/submission/:submissionId',
  auth,
  admin,
  ctrl.deleteSubmission
);

// 8. Start Task Page (update URL)
router.post(
  '/tasks/:id/url',
  auth,
  admin,
  ctrl.updateTaskUrl
);

module.exports = router;
