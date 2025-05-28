const Job = require('../models/Job');
const User = require('../models/User');

exports.postJob = async (req, res) => {
  const { title, description, amount, project } = req.body;
  const attachment = req.file ? req.file.path : null;
  const job = new Job({ title, description, amount, project, postedBy: req.user.id });
  if (attachment) job.attachment = attachment;
  await job.save();
  res.json(job);
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ msg: 'Job not found' });
  res.json(job);
};

exports.assignJob = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  job.assignedTo = req.body.remoteWorkerId;
  job.status = 'in-progress';
  await job.save();
  await User.findByIdAndUpdate(req.body.remoteWorkerId, { $push: { assignedJobs: job._id } });
  res.json(job);
};

exports.completeJob = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ msg: 'Job not found' });
  job.workFile = req.file.path;
  job.status = 'completed';
  await job.save();
  res.json(job);
};

exports.cancelJob = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (job.postedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });
  job.status = 'cancelled';
  await job.save();
  res.json(job);
};

exports.attemptJob = async (req, res) => {
  // record attempt logic if needed
  res.json({ msg: 'Attempt recorded' });
};
