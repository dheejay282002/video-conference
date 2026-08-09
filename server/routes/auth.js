const express = require('express');
const passport = require('passport');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { register, login, getMe, logout, updateProfile, uploadAvatar } = require('../controllers/authController');
const { auth, generateToken } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

const CLIENT_URL = process.env.CLIENT_URL || process.env.SERVER_URL || 'http://localhost:5173';

// Local auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);
router.put('/profile', auth, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

// Google OAuth - initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth - callback with proper error handling
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err.message);
      return res.redirect(`${CLIENT_URL}/login?error=server_error`);
    }
    if (!user) {
      const msg = info?.message || 'google_not_registered';
      return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    return res.redirect(`${CLIENT_URL}/dashboard`);
  })(req, res, next);
});

module.exports = router;
