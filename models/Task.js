// backend/models/Task.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: String,
  status:  {
    type: String,
    enum: ['in-progress','completed'],
    required: true,
    default: 'in-progress'    // ← default ensures no validation error
  },
  approved: { type: Boolean, default: false },
  date:    { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  amount:      { type: Number, required: true },
  externalUrl: String,
  submissions: [SubmissionSchema],
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
