/**
 * Authentication Middleware
 * 
 * This middleware validates JWT tokens for protected routes.
 * It extracts the token from the Authorization header, verifies it,
 * and attaches the authenticated user to the request object.
 * 
 * @module middleware/auth
 * @requires jsonwebtoken
 * @requires ../models/User
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens and loading user data.
 * Token should be provided in the Authorization header as: "Bearer <token>"
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @throws {401} If no token is provided
 * @throws {401} If token is invalid or expired
 * @throws {404} If user not found in database
 * @throws {500} If server error occurs during verification
 * 
 * @example
 * // Usage in routes
 * router.get('/protected', auth, (req, res) => {
 *   // req.user contains authenticated user data
 *   res.json({ user: req.user });
 * });
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No authentication token provided',
        error: 'MISSING_TOKEN'
      });
    }

    // Check if token follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid token format. Use: Bearer <token>',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        error: 'EMPTY_TOKEN'
      });
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error',
        error: 'JWT_SECRET_MISSING'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          error: 'TOKEN_EXPIRED'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: 'INVALID_TOKEN'
        });
      }
      throw jwtError; // Re-throw other errors
    }

    // Validate decoded payload
    if (!decoded.id) {
      return res.status(401).json({ 
        message: 'Invalid token payload',
        error: 'INVALID_PAYLOAD'
      });
    }

    // Find user in database and exclude password
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: 'SERVER_ERROR'
    });
  }
};

module.exports = auth;
