/**
 * Authentication Routes
 * 
 * This module handles all authentication-related endpoints including:
 * - User registration with email/password
 * - User login with email/password
 * - Google OAuth authentication
 * - JWT token generation and validation
 * - User profile management
 * 
 * @module routes/auth
 * @requires express
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires passport
 * @requires ../models
 * @requires ../middleware/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Generate JWT Token
 * Helper function to create a JWT token for authenticated users
 * 
 * @param {string} userId - User's database ID
 * @returns {string} JWT token
 * @private
 */
const generateToken = (userId) => {
  const payload = { id: userId };
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'blogging-app',
  });
};

/**
 * Validate Registration Input
 * Helper function to validate user registration data
 * 
 * @param {Object} data - Registration data
 * @returns {Object} { valid: boolean, errors: Array }
 * @private
 */
const validateRegistration = (data) => {
  const errors = [];
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Password validation
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // DOB validation
  if (!data.dob) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(data.dob);
    const thirteenYearsAgo = new Date();
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
    
    if (dob > thirteenYearsAgo) {
      errors.push('You must be at least 13 years old to register');
    }
  }
  
  // Gender validation
  if (!data.gender || !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.push('Gender must be male, female, or other');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 * 
 * @body {string} name - User's full name (required, min 2 chars)
 * @body {string} email - User's email address (required, must be valid)
 * @body {string} password - User's password (required, min 6 chars)
 * @body {string} dob - Date of birth in ISO format (required, must be 13+)
 * @body {string} gender - User's gender: male, female, or other (required)
 * @body {string} nickname - Optional nickname/display name
 * 
 * @returns {Object} 200 - { token: string, user: Object }
 * @returns {Object} 400 - { message: string, errors: Array } - Validation errors
 * @returns {Object} 409 - { message: string } - User already exists
 * @returns {Object} 500 - { message: string } - Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { name, dob, gender, nickname, email, password } = req.body;
    
    // Validate input
    const validation = validateRegistration({ name, email, password, dob, gender });
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validation.errors 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (user) {
      return res.status(409).json({ 
        message: 'User already exists with this email address' 
      });
    }

    // Hash password with bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = await User.create({
      name: name.trim(),
      dob: new Date(dob),
      gender: gender.toLowerCase(),
      nickname: nickname ? nickname.trim() : '',
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return token and user data (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message];
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email and password
 * @access  Public
 * 
 * @body {string} email - User's email address (required)
 * @body {string} password - User's password (required)
 * 
 * @returns {Object} 200 - { token: string, user: Object }
 * @returns {Object} 400 - { message: string } - Invalid credentials
 * @returns {Object} 401 - { message: string } - Password incorrect
 * @returns {Object} 500 - { message: string } - Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide both email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please login with Google.' 
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return token and user data
    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 * 
 * Redirects user to Google's OAuth consent screen
 */
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback handler
 * @access  Public
 * 
 * Handles the callback from Google after user authorization.
 * Creates or updates user account and returns JWT token.
 * 
 * @returns Redirect to frontend with token or error
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token for authenticated user
      const token = generateToken(req.user.id);
      
      // Redirect to frontend with token
      // Adjust the URL based on your frontend configuration
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/auth/success?token=${token}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('/api/auth/google/failure');
    }
  }
);

/**
 * @route   GET /api/auth/google/failure
 * @desc    Google OAuth failure handler
 * @access  Public
 * 
 * @returns {Object} 401 - { message: string }
 */
router.get('/google/failure', (req, res) => {
  res.status(401).json({ 
    message: 'Google authentication failed',
    error: 'GOOGLE_AUTH_FAILED'
  });
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current authenticated user's profile
 * @access  Private (requires JWT token)
 * 
 * @header {string} Authorization - Bearer token (required)
 * 
 * @returns {Object} 200 - User profile data
 * @returns {Object} 401 - { message: string } - Unauthorized
 * @returns {Object} 404 - { message: string } - User not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/user', auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json(user.getPublicProfile());
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      message: 'Server error while fetching user data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile information
 * @access  Private (requires JWT token)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @body {string} name - User's name (optional)
 * @body {string} dob - Date of birth (optional)
 * @body {string} gender - Gender (optional)
 * @body {string} nickname - Nickname (optional)
 * 
 * @returns {Object} 200 - { message: string, user: Object }
 * @returns {Object} 400 - { message: string, errors: Array } - Validation errors
 * @returns {Object} 401 - { message: string } - Unauthorized
 * @returns {Object} 404 - { message: string } - User not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, dob, gender, nickname } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({ 
          message: 'Name must be at least 2 characters long' 
        });
      }
      user.name = name.trim();
    }

    if (dob !== undefined) {
      const dobDate = new Date(dob);
      const thirteenYearsAgo = new Date();
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
      
      if (dobDate > thirteenYearsAgo) {
        return res.status(400).json({ 
          message: 'You must be at least 13 years old' 
        });
      }
      user.dob = dobDate;
    }

    if (gender !== undefined) {
      if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
        return res.status(400).json({ 
          message: 'Gender must be male, female, or other' 
        });
      }
      user.gender = gender.toLowerCase();
    }

    if (nickname !== undefined) {
      user.nickname = nickname.trim();
    }

    // Save updated user
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (err) {
    console.error('Profile update error:', err);
    
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors ? err.errors.map(e => e.message) : [err.message];
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Update user password
 * @access  Private (requires JWT token)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @body {string} currentPassword - Current password (required)
 * @body {string} newPassword - New password (required, min 6 chars)
 * 
 * @returns {Object} 200 - { message: string }
 * @returns {Object} 400 - { message: string } - Validation errors
 * @returns {Object} 401 - { message: string } - Current password incorrect
 * @returns {Object} 404 - { message: string } - User not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide both current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In and does not have a password' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save updated user
    await user.save();

    res.json({
      message: 'Password updated successfully',
    });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ 
      message: 'Server error while updating password',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
