// backend/utils/emailNotifier.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailNotifier = async (subject, message) => {
  await transporter.sendMail({
    from: `"RemoteJob Platform" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: `<p>${message}</p>`
  });
};

module.exports = emailNotifier;
