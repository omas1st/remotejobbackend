// backend/models/Wallet.js
const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  amount: Number,
  date: { type: Date, default: Date.now }
});

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  balance: { type: Number, default: 0 },
  withdrawals: [WithdrawalSchema]
});

module.exports = mongoose.model('Wallet', WalletSchema);
