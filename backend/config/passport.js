/**
 * Passport Configuration for Google OAuth 2.0
 * 
 * This module configures Passport.js to handle Google OAuth authentication.
 * It defines the strategy for authenticating users via their Google account
 * and handles user creation/lookup in the database.
 * 
 * @module config/passport
 * @requires passport
 * @requires passport-google-oauth20
 * @requires ../models
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

/**
 * Configure Google OAuth Strategy
 * 
 * This strategy authenticates users using their Google account.
 * Upon successful authentication, it either finds an existing user
 * or creates a new user in the database.
 * 
 * @param {string} GOOGLE_CLIENT_ID - Google OAuth client ID from .env
 * @param {string} GOOGLE_CLIENT_SECRET - Google OAuth client secret from .env
 * @param {string} callbackURL - URL where Google redirects after authentication
 */

// Construct the full callback URL
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
const CALLBACK_URL = `${BACKEND_URL}/api/auth/google/callback`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Extract user information from Google profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName || 'Google User';

        // Validate required fields
        if (!email) {
          return done(new Error('Email not provided by Google'), null);
        }

        // Check if user with this email already exists (registered via email/password)
        user = await User.findOne({ where: { email } });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user with Google account
        // Note: DOB and gender will need to be updated by user later
        user = await User.create({
          googleId: profile.id,
          email,
          name,
          dob: new Date('2000-01-01'), // Default value, user should update
          gender: 'other', // Default value, user should update
          nickname: '',
        });

        done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error, null);
      }
    }
  )
);

/**
 * Serialize user for session storage
 * Stores user ID in the session
 * 
 * @param {Object} user - User object from database
 * @param {Function} done - Callback function
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 * Retrieves full user object from database using stored ID
 * 
 * @param {string} id - User ID from session
 * @param {Function} done - Callback function
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
