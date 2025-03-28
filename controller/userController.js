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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save({ validateBeforeSave: false });

    console.log(`Generated Token: ${token}`);
    console.log(`Saved User:`, user);

    const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
    await sendResetEmail(email, resetUrl);

    res.json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Forgot password failed', message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const { isValid, errors } = validateUserInput({ password });
    if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    // Hash new password manually
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
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
  resetPassword,
  getProfile
};