const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});

const sendResetEmail = async (email, message) => {
  try {
  const mailOptions = {
    from: config.emailUser,
    to: email,
    subject: 'Password Reset OTP',
    text: message,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email}`);
} catch (error) {
  console.error('Error sending error:', error);
  throw new Error('Failed to send email')
}
};

module.exports = { sendResetEmail };