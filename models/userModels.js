const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  googleId: { 
    type: String,
    unique: true, 
    sparse: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String,
    default: null,
    index: true
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    expires: 600
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;