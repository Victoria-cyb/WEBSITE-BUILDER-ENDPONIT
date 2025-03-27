const express = require('express');
const auth = require('../middleware/auth')
const { inputNewData, inputData, forgotPassword, resetPassword, getProfile } = require('../controller/userController');


const router = express.Router();

router.post('/register', inputNewData);

router .post('/login', inputData);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.get('/profile', auth, getProfile);

module.exports = router