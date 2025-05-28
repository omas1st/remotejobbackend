// backend/routes/taskRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/taskController');

const router = express.Router();

// Public fetch all tasks
router.get('/', auth, ctrl.getAllTasksPublic);

// Get individual task + submissions
router.get('/:id', auth, ctrl.getTaskById);

// Start a task
router.post('/start/:id', auth, ctrl.startTask);

// Mark attempt completed
router.post('/attempt/:id', auth, ctrl.attemptTask);

module.exports = router;
