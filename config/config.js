const mongoose = require('mongoose')

require('dotenv').config()

module.exports = {
    mongoURI: process.env.MONGODB_URI,
   jwtSecret: process.env.JWT_SECRET,
   googleClientId: process.env.CLIENT_ID,
  googleClientSecret: process.env.CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};