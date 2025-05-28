const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getAllUsers,
  getAllJobs,
  approveJob,
  getTaskSubmissions,
  approveSubmission
} = require('../controllers/adminController');

router.get('/users', auth, admin, getAllUsers);
router.get('/jobs', auth, admin, getAllJobs);
router.post('/approve-job/:jobId', auth, admin, approveJob);
router.get('/task-submissions', auth, admin, getTaskSubmissions);
router.post('/approve-submission/:submissionId', auth, admin, approveSubmission);

module.exports = router;
