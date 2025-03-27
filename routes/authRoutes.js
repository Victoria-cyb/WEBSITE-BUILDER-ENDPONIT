const express = require('express');
const { googleAuthStart, googleAuthCallback } = require('../controller/authController')



const router = express.Router();

router.get('/google', googleAuthStart);
router.get('/google/callback',  googleAuthCallback );







module.exports = router;