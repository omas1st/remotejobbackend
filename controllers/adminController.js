// backend/controllers/adminController.js
const User = require('../models/User');
const Task = require('../models/Task');
const emailNotifier = require('../utils/emailNotifier');

/**
 * 1. Users Profile Page
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ registeredAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 2. Message Page (no file upload)
 */
exports.sendMessageToUser = async (req, res) => {
  const { email, message } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const msg = {
      from: 'Admin',
      content: message,
      files: []  // uploads disabled
    };

    user.messages.push(msg);
    await user.save();

    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 3. Wallet Page
 */
exports.editWalletBalance = async (req, res) => {
  const { email, balance } = req.body;
  const io = req.app.locals.io;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance = balance;
    await user.save();

    io.emit('walletUpdate', {
      userId: user._id,
      newBalance: user.walletBalance
    });

    res.json({ message: 'Wallet updated', walletBalance: user.walletBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 4. Verify Withdrawal PIN
 */
exports.setVerifyPin = async (req, res) => {
  const { email, pin } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.verifyPin = pin;
    await user.save();
    res.json({ message: 'Verify PIN set' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 5. Tasks Page
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, amount, externalUrl } = req.body;
  try {
    const task = await Task.create({ title, description, amount, externalUrl });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, amount, externalUrl } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, amount, externalUrl },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 6. Payment URL Page
 */
exports.setPaymentUrl = async (req, res) => {
  const { email, url, approved, slot } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = user.paymentUrls.find(p => p.slot === slot);
    if (existing) {
      existing.url = url;
      existing.approved = approved;
    } else {
      user.paymentUrls.push({ slot, url, approved });
    }
    await user.save();
    res.json({ message: 'Payment URL updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 6b. Get a user’s payment URLs (for admin)
 */
exports.getPaymentUrls = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email }).select('paymentUrls');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.paymentUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 7. Task Payment Approval Page
 */
exports.getTaskSubmissions = async (req, res) => {
  try {
    const tasks = await Task.find().populate('submissions.user', 'firstName lastName email');
    const subs = [];
    tasks.forEach(task => {
      task.submissions.forEach(sub => {
        if (sub.status === 'completed') {
          subs.push({
            submissionId: sub._id,
            userId: sub.user._id,
            userEmail: sub.user.email,
            userName: `${sub.user.firstName} ${sub.user.lastName}`,
            taskId: task._id,
            taskTitle: task.title,
            amount: task.amount,
            approved: sub.approved
          });
        }
      });
    });
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveSubmission = async (req, res) => {
  const { submissionId } = req.params;
  try {
    const task = await Task.findOne({ 'submissions._id': submissionId });
    if (!task) return res.status(404).json({ message: 'Submission not found' });

    const sub = task.submissions.id(submissionId);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'completed') {
      return res.status(400).json({ message: 'Submission not completed yet' });
    }
    if (sub.approved) {
      return res.status(400).json({ message: 'Submission already approved' });
    }

    sub.approved = true;
    await task.save();

    const user = await User.findById(sub.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.walletBalance = (user.walletBalance || 0) + task.amount;

    // In-dashboard notification
    user.messages.push({
      from: 'System',
      content: `Your payment of $${task.amount} for "${task.title}" has been approved and credited to your wallet.`,
      files: []
    });
    await user.save();

    res.json({ message: 'Submission approved and wallet updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 7c. Delete a submission
 */
exports.deleteSubmission = async (req, res) => {
  const { submissionId } = req.params;
  try {
    const task = await Task.findOne({ 'submissions._id': submissionId });
    if (!task) return res.status(404).json({ message: 'Submission not found' });
    task.submissions.id(submissionId).remove();
    await task.save();
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 8. Start Task Page
 */
exports.updateTaskUrl = async (req, res) => {
  const { id } = req.params;
  const { externalUrl } = req.body;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.externalUrl = externalUrl;
    await task.save();
    res.json({ message: 'Task URL updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
