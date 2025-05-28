const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  postJob,
  getJobs,
  getJobById,
  assignJob,
  completeJob,
  cancelJob,
  attemptJob
} = require('../controllers/jobController');

router.get('/', auth, getJobs);
router.get('/:id', auth, getJobById);
router.post('/post', auth, upload.single('attachment'), postJob);
router.post('/assign/:jobId', auth, admin, assignJob);
router.post('/complete/:jobId', auth, upload.single('workFile'), completeJob);
router.post('/cancel/:jobId', auth, cancelJob);
router.post('/attempt/:jobId', auth, attemptJob);

module.exports = router;
