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

// Google OAuth - callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${CLIENT_URL}/login?error=google_not_registered`,
    successRedirect: `${CLIENT_URL}/dashboard`
  })
);

module.exports = router;
