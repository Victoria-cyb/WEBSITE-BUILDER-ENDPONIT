const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');
const crypto = require('crypto');
const { validateUserInput } = require('../utils/validator');
const { sendResetEmail } = require('../utils/mailer');
const config = require('../config/config');

const inputNewData = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;
    const { isValid, errors } = validateUserInput({ email, password });
    if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = new User({ firstName, lastName, userName, email, password: hashedPassword });
    await user.save();

    // const token = jwt.sign({ id: user._id, email, name }, config.jwtSecret, { expiresIn: '1h' });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
};

const inputData = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { isValid, errors } = validateUserInput({ email, password });
    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password manually
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email, name: user.name }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expires;
    user.markModified('resetPasswordToken'); // Ensure Mongoose recognizes the change
    user.markModified('resetPasswordExpires');
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findOne({ email });
    console.log(`Generated OTP: ${otp}`);
    console.log(`[forgotPassword] Expiration: ${expires}`);
    console.log(`Saved User:`, user);
    console.log(`[forgotPassword] User after save:`, await User.findOne({ email }));

    if (!updatedUser.resetPasswordToken) {
      throw new Error('OTP not saved to database');
    }

    const message = `Your password reset OTP is: ${otp}. it expires in 10 minutes, Do not share this code with anyone`;
    await sendResetEmail(email, message);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Forgot password failed', message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, token } = req.body;

    // Ensure token is a string and remove whitespace
    const otpToCheck = String(token).trim();
    console.log(`[verifyOtp] Received OTP: ${otpToCheck}`);

    // Find user with matching OTP and ensure OTP is not expired
    const user = await User.findOne({
      email,
      resetPasswordToken: otpToCheck,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure OTP hasn't expired
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // If OTP is valid, mark user as verified (optional, can be a flag)
    res.json({ success: true, message: 'OTP is valid' });

  } catch (err) {
    console.log(`[verifyOtp] Error: ${err.message}`);
    res.status(500).json({ error: 'OTP verification failed', message: err.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const { isValid, errors } = validateUserInput({ password });
   if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Ensure token is a string
    const otpToCheck = String(token).trim(); // Remove any whitespace
    console.log(`[resetPassword] Received OTP: ${otpToCheck}`);

    const user = await User.findOne({
      email,
      resetPasswordToken: otpToCheck, // Match exactly as string
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log(`[resetPassword] Found user:`, user ? user.email : 'No user found');
    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });
    // console.log(`[resetPassword] Found user:`, user);


    // Hash new password manually
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.log(`[resetPassword] Error: ${err.message}`);
    res.status(500).json({ error: 'Reset password failed', message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.name).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Profile fetch failed', message: err.message });
  }
};

module.exports = {
  inputNewData,
  inputData,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile
};