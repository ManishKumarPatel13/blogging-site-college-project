/**
 * Database Configuration
 * 
 * This module handles PostgreSQL database connection using Sequelize ORM.
 * Provides connection utilities and error handling for database operations.
 * 
 * @module config/db
 * @requires sequelize
 */

const { Sequelize } = require('sequelize');

/**
 * Sequelize instance for PostgreSQL connection
 * @type {Sequelize}
 */
let sequelize;

/**
 * Connect to PostgreSQL Database
 * 
 * Establishes connection to PostgreSQL using connection string from environment variables.
 * Implements connection options for better performance and stability.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<Sequelize>} Sequelize instance
 * @throws {Error} If connection fails or DATABASE_URL is not defined
 * 
 * @example
 * const connectDB = require('./config/db');
 * await connectDB();
 */
const connectDB = async () => {
  try {
    // Get PostgreSQL URI from environment variables
    const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    // Validate PostgreSQL URI exists
    if (!DATABASE_URL) {
      throw new Error(
        'PostgreSQL connection string is not defined. ' +
        'Please set DATABASE_URL or POSTGRES_URL in your .env file'
      );
    }

    // Create Sequelize instance with connection options
    sequelize = new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // For Render.com and similar hosting
        }
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // Test the connection
    await sequelize.authenticate();

    // Log successful connection
    console.log('✓ PostgreSQL Connected Successfully');
    console.log(`  Database: ${sequelize.config.database}`);
    console.log(`  Host: ${sequelize.config.host}`);

    // Set up graceful shutdown
    setupEventListeners();

    return sequelize;

  } catch (err) {
    console.error('✗ PostgreSQL Connection Error:', err.message);
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', err);
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Setup PostgreSQL Event Listeners
 * 
 * Configures event handlers for graceful shutdown
 * 
 * @private
 */
const setupEventListeners = () => {
  // PostgreSQL process terminated
  process.on('SIGINT', async () => {
    await closeConnection();
    console.log('PostgreSQL connection closed due to application termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeConnection();
    console.log('PostgreSQL connection closed due to application termination');
    process.exit(0);
  });
};

/**
 * Get PostgreSQL Connection Status
 * 
 * Returns the current state of the PostgreSQL connection
 * 
 * @function getConnectionStatus
 * @returns {string} Connection status: 'connected' or 'disconnected'
 * 
 * @example
 * const status = getConnectionStatus();
 * console.log(`Database status: ${status}`);
 */
const getConnectionStatus = () => {
  try {
    if (sequelize) {
      return 'connected';
    }
    return 'disconnected';
  } catch (err) {
    return 'disconnected';
  }
};

/**
 * Get Sequelize Instance
 * 
 * Returns the Sequelize instance for model definitions
 * 
 * @function getSequelize
 * @returns {Sequelize} Sequelize instance
 */
const getSequelize = () => {
  if (!sequelize) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return sequelize;
};

/**
 * Close Database Connection
 * 
 * Gracefully closes the PostgreSQL connection
 * 
 * @async
 * @function closeConnection
 * @returns {Promise<void>}
 * 
 * @example
 * await closeConnection();
 */
const closeConnection = async () => {
  try {
    if (sequelize) {
      await sequelize.close();
      console.log('✓ PostgreSQL connection closed gracefully');
    }
  } catch (err) {
    console.error('✗ Error closing PostgreSQL connection:', err);
    throw err;
  }
};

module.exports = {
  connectDB,
  getConnectionStatus,
  closeConnection,
  getSequelize
};
