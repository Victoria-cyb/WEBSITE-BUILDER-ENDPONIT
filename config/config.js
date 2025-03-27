const { mongo } = require('mongoose')

require('dotenv').config()

module.exports = {
    mongoURI: process.env.MONGO_URI,
   jwtSecret: process.env.JWT_SECRET,
   googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};