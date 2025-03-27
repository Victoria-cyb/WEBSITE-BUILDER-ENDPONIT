const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});

const sendResetEmail = async (to, resetUrl) => {
  const mailOptions = {
    from: config.emailUser,
    to,
    subject: 'Password Reset Request',
    text: `Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };