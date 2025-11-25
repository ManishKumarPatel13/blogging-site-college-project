/**
 * Blogging Application Server
 * 
 * Main server file for the blogging application backend.
 * Configures Express server, middleware, database connection,
 * authentication, and API routes.
 * 
 * @module server
 * @requires express
 * @requires sequelize
 * @requires dotenv
 * @requires cors
 * @requires express-session
 * @requires passport
 */

// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { connectDB, getSequelize, closeConnection } = require('./config/db');
const { initModels, syncDatabase } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const aiRoutes = require('./routes/ai');

// Initialize Express application
const app = express();

/**
 * Middleware Configuration
 */

// Enable CORS for cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

/**
 * Request Logging Middleware (Development only)
 * Logs all incoming requests for debugging purposes
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);

/**
 * Health Check Endpoint
 * Used to verify server status
 * 
 * @route GET /
 * @returns {Object} Server status and information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Blogging App Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      ai: '/api/ai',
    },
  });
});

/**
 * API Documentation Endpoint
 * Provides basic API documentation
 * 
 * @route GET /api
 * @returns {Object} API information and available endpoints
 */
app.get('/api', (req, res) => {
  res.json({
    message: 'Blogging App API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        googleAuth: 'GET /api/auth/google',
        getUser: 'GET /api/auth/user (protected)',
        updateProfile: 'PUT /api/auth/profile (protected)',
        updatePassword: 'PUT /api/auth/password (protected)',
      },
      blogs: {
        getAll: 'GET /api/blogs',
        getRecent: 'GET /api/blogs/recent',
        getOne: 'GET /api/blogs/:id',
        create: 'POST /api/blogs (protected)',
        update: 'PUT /api/blogs/:id (protected)',
        delete: 'DELETE /api/blogs/:id (protected)',
        getUserBlogs: 'GET /api/blogs/user/:userId',
        getMyBlogs: 'GET /api/blogs/my/posts (protected)',
      },
    },
  });
});

/**
 * 404 Error Handler
 * Handles requests to undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: 'NOT_FOUND',
    path: req.path,
  });
});

/**
 * Global Error Handler
 * Catches and handles all errors in the application
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

/**
 * Database Connection and Initialization
 * Connects to PostgreSQL using Sequelize, initializes models, and syncs database
 */
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('CRITICAL ERROR: PostgreSQL connection string is not defined');
  console.error('Please set DATABASE_URL or POSTGRES_URL in your .env file');
  process.exit(1);
}

// Initialize database connection and models
(async () => {
  try {
    // Connect to PostgreSQL
    const sequelize = await connectDB();
    console.log('✓ PostgreSQL connected successfully');
    console.log(`  Database: ${sequelize.config.database}`);
    
    // Initialize all models
    initModels();
    console.log('✓ Models initialized');
    
    // Sync database (create tables if they don't exist)
    await syncDatabase();
    console.log('✓ Database synchronized');
    
  } catch (err) {
    console.error('✗ Database initialization error:', err.message);
    process.exit(1);
  }
})();

/**
 * Server Configuration and Startup
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Blogging App Server Started');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 API URL: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log('='.repeat(50) + '\n');
});

/**
 * Graceful Shutdown Handler
 * Handles server shutdown signals (SIGTERM, SIGINT)
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close server
  server.close(async () => {
    console.log('✓ HTTP server closed');
    
    // Close database connection
    try {
      await closeConnection();
      console.log('✓ PostgreSQL connection closed');
      process.exit(0);
    } catch (err) {
      console.error('✗ Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;

