const User = require('../models/userModels');
const { OAuth2Client } = require ('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config/config')

const client = new OAuth2Client( 
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
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
      const token = jwt.sign({ id: user._id, email, name }, config.jwtSecret, { expiresIn: '1h' });
    res.redirect(`${config.frontendUrl}/dashboard?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: 'Google auth failed', message: error.message });
  }
};

module.exports = { googleAuthStart, googleAuthCallback };
