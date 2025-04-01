const User = require('../models/userModels');
const { OAuth2Client } = require ('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('../config/config')

const client = new OAuth2Client( 
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const googleAuthStart = (req, res) => {
    const authUrl = client.generateAuthUrl({
      scope: ['profile', 'email'],
    });
    res.redirect(authUrl);
  };

  const googleAuthCallback = async (req, res) => {
    try {
      const code = req.query.code;
      if (!code) throw new Error('No authorization code provided');
      const { tokens } = await client.getToken(code);
  
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId,
      });
      const payload = ticket.getPayload();
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
