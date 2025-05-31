// backend/controllers/userController.js
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');

// Helper: if no req.user, send 401 and stop
function ensureAuth(req, res) {
  if (!req.user) {
    res.status(401).json({ message: 'Session expired or not authenticated.' });
    return true;
  }
  return false;
}

// 1. Get current user profile
exports.getProfile = async (req, res) => {
  if (ensureAuth(req, res)) return;
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Update profile
exports.updateProfile = async (req, res) => {
  if (ensureAuth(req, res)) return;
  const { firstName, lastName, country } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, country },
      { new: true }
    );
    await emailNotifier(
      'Profile Update',
      `User ${user.firstName} ${user.lastName} (Profile: ${user.profileType}) updated their profile.`
    );
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Send message to admin
exports.contactAdmin = async (req, res) => {
  if (ensureAuth(req, res)) return;
  const { content } = req.body;
  try {
    const user = await User.findById(req.user.id);
    await emailNotifier(
      'User Message to Admin',
      `From ${user.firstName} ${user.lastName} (${user.email}): ${content}`
    );
    res.status(200).json({ message: 'Message sent to admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Get messages (inbox)
exports.getMessages = async (req, res) => {
  if (ensureAuth(req, res)) return;
  try {
    const user = await User.findById(req.user.id).select('messages');
    res.status(200).json(user.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 5. Verify withdrawal PIN
exports.verifyWithdrawalPin = async (req, res) => {
  if (ensureAuth(req, res)) return;
  const { pin } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.verifyPin) {
      return res.status(400).json({ message: 'No PIN set for user' });
    }
    if (user.verifyPin !== pin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }
    res.json({ message: 'PIN verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 6. Get this user’s payment URLs
exports.getUserPaymentUrls = async (req, res) => {
  if (ensureAuth(req, res)) return;
  try {
    const user = await User.findById(req.user.id).select('paymentUrls');
    res.status(200).json(user.paymentUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
