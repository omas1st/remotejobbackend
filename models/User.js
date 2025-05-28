// backend/models/User.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: String,
  content: String,
  files: [String],
  date: { type: Date, default: Date.now }
});

const PaymentUrlSchema = new mongoose.Schema({
  slot: Number,
  url: String,
  approved: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  profileType: { type: String, enum: ['worker','customer'], required: true },
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, required: true },
  gender:       { type: String, enum: ['male','female'], required: true },
  country:      { type: String, required: true },
  password:     { type: String, required: true },
  walletBalance:{ type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
  verifyPin:    { type: String },
  messages:     [MessageSchema],
  paymentUrls:  [PaymentUrlSchema]
});

module.exports = mongoose.model('User', UserSchema);
