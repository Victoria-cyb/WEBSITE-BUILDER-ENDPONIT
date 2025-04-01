const User = require('../models/userModels');
const { OAuth2Client } = require ('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('../config/config')

// Log environment variables at startup
console.log('Starting server...');
console.log('CLIENT_ID:', process.env.CLIENT_ID || 'MISSING');
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET || 'MISSING');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'MISSING');

// Validate OAuth2Client config
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  console.error('OAuth2Client configuration incomplete. Check environment variables.');
  process.exit(1); // Crash intentionally if misconfigured
}

const client = new OAuth2Client( 
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

const googleAuthStart = (req, res) => {
  try {
    const authUrl = client.generateAuthUrl({
      scope: ['profile', 'email'],
    });
    console.log('Generated auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error in googleAuthStart:', error.message);
    res.status(500).json({ error: 'Failed to start Google auth', message: error.message });
  }

  };

  const googleAuthCallback = async (req, res) => {
    try {
      const code = req.query.code;
      if (!code) throw new Error('No authorization code provided');

      console.log('Received code:', code);

      const { tokens } = await client.getToken({code, redirect_uri: config.googleRedirectUri,});
  
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId,
      });
      if (!ticket) throw new Error('Token verification failed');

      const payload = ticket.getPayload();
      if (!payload) throw new Error('No payload in ticket');

      const email = payload.email;
      const name = payload.name;
  
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ email, name });
        await user.save();
      }
      const token = jwt.sign({ id: user._id, email, name }, config.jwtSecret);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google auth error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Google auth failed', message: error.message });
  }
};

module.exports = { googleAuthStart, googleAuthCallback };
