// backend/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');

/**
 * GET /api/tasks
 * Public list of tasks (admin-level routes handle creation)
 */
exports.getAllTasksPublic = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/tasks/:id
 * Return task + submissions
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/tasks/start/:id
 * Mark a new submission "in-progress" for current user
 */
exports.startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Prevent duplicate starts
    const already = task.submissions.find(s => s.user.equals(req.user.id));
    if (already) {
      return res.status(400).json({ message: 'Already started' });
    }

    task.submissions.push({
      user: req.user.id,
      status: 'in-progress'
    });
    await task.save();

    // Notify admin of start
    const user = await User.findById(req.user.id);
    await emailNotifier(
      'Task Started',
      `User ${user.email} started task "${task.title}" (ID: ${task._id}).`
    );

    res.json({ message: 'Task started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/tasks/attempt/:id
 * Mark the submission as "completed"
 */
exports.attemptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const sub = task.submissions.find(s => s.user.equals(req.user.id));
    if (!sub) {
      return res.status(400).json({ message: 'Task not started yet' });
    }
    if (sub.status === 'completed') {
      return res.status(400).json({ message: 'Already completed' });
    }

    sub.status = 'completed';
    await task.save();

    // Notify admin of completion
    const user = await User.findById(req.user.id);
    await emailNotifier(
      'Task Attempted',
      `User ${user.email} completed task "${task.title}" (ID: ${task._id}).`
    );

    res.json({ message: 'Task marked completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
