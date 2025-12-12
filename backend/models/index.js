/**
 * Models Index
 * 
 * This module initializes all Sequelize models and their associations.
 * It exports all models for use throughout the application.
 * 
 * @module models/index
 */

const { initUserModel, User } = require('./User');
const { initBlogModel, associateBlog, Blog } = require('./Blog');

/**
 * Initialize all models
 * 
 * This function must be called after database connection is established
 * 
 * @returns {Object} Object containing all initialized models
 */
const initModels = () => {
  // Initialize models
  initUserModel();
  initBlogModel();

  // Set up associations
  const models = { User, Blog };
  associateBlog(models);

  // User has many blogs
  User.hasMany(Blog, {
    foreignKey: 'authorId',
    as: 'blogs',
  });

  return models;
};

/**
 * Sync database tables
 * Creates tables if they don't exist
 * 
 * @param {boolean} force - If true, drops existing tables (DANGER!)
 * @returns {Promise<void>}
 */
const syncDatabase = async (force = false) => {
  const { getSequelize } = require('../config/db');
  const sequelize = getSequelize();

  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✓ Database tables synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  User,
  Blog,
  initModels,
  syncDatabase,
};
