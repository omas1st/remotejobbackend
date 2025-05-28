// backend/controllers/walletController.js
const User = require('../models/User');
const emailNotifier = require('../utils/emailNotifier');

// GET /api/wallet
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ balance: user.walletBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/wallet/withdraw
// Body: { amount, crypto, address, pin }
exports.requestWithdraw = async (req, res) => {
  const { amount, crypto, address, pin } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1) Verify PIN
    if (!user.verifyPin || user.verifyPin !== pin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    // 2) Check funds
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // 3) Deduct
    user.walletBalance -= amount;

    // 4) Record in messages
    user.messages.push({
      from: 'System',
      content: `Your withdrawal of $${amount} in ${crypto} to ${address} has been processed.`,
      files: []
    });

    await user.save();

    // 5) Notify admin
    await emailNotifier(
      'Withdrawal Confirmed',
      `User ${user.email} confirmed withdrawal of $${amount} in ${crypto} to address ${address}.`
    );

    res.json({ message: 'Withdrawal processed', walletBalance: user.walletBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
