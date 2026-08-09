const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/google/callback`,
        scope: ['profile', 'email'],
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Check if user exists by email
          let user = await User.findOne({ email });

          if (!user) {
            // User not registered - block login
            return done(null, false, {
              message: 'No account found with this email. Please register first.'
            });
          }

          // User exists - link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar && profile.photos[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('Google OAuth configured (registration required)');
} else {
  console.log('Google OAuth skipped (no credentials)');
}

module.exports = passport;
