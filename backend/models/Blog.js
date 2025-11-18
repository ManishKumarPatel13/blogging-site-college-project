/**
 * Blog Post Model
 * 
 * This module defines the Blog schema and model for blog posts.
 * Each blog post is associated with a user (author) and contains
 * content, media, styling preferences, and metadata.
 * 
 * @module models/Blog
 * @requires sequelize
 */

const { DataTypes, Model } = require('sequelize');
const { getSequelize } = require('../config/db');

/**
 * Blog Model Class
 * 
 * Defines the structure of blog post records in PostgreSQL.
 */
class Blog extends Model {
  /**
   * Instance method to get blog summary
   * Returns a truncated version of the blog content for previews
   * 
   * @param {number} length - Maximum length of summary (default: 200)
   * @returns {string} Truncated content
   */
  getSummary(length = 200) {
    if (this.content.length <= length) {
      return this.content;
    }
    return this.content.substring(0, length) + '...';
  }

  /**
   * Static method to get recent blogs
   * Retrieves the most recent blog posts with author details
   * 
   * @param {number} limit - Maximum number of blogs to return (default: 10)
   * @returns {Promise<Array>} Array of blog documents with populated author
   */
  static async getRecentBlogs(limit = 10) {
    const { User } = require('./User');
    return this.findAll({
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'nickname', 'email'],
        },
      ],
    });
  }
}

/**
 * Initialize Blog Model
 * 
 * Defines the Blog schema with all fields and validations
 * 
 * @returns {typeof Blog} Blog model class
 */
const initBlogModel = () => {
  const sequelize = getSequelize();

  Blog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'author_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Blog post must have content',
          },
          len: {
            args: [1, 50000],
            msg: 'Content must be between 1 and 50,000 characters',
          },
        },
      },
      media: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
        validate: {
          isArrayOfUrls(value) {
            if (value && Array.isArray(value)) {
              const urlRegex = /^https?:\/\/.+/;
              const allValid = value.every((url) => urlRegex.test(url));
              if (!allValid) {
                throw new Error('All media URLs must be valid HTTP/HTTPS URLs');
              }
            }
          },
        },
      },
      template: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'default',
        validate: {
          len: {
            args: [0, 50],
            msg: 'Template name cannot exceed 50 characters',
          },
        },
      },
      font: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Arial',
        validate: {
          len: {
            args: [0, 50],
            msg: 'Font name cannot exceed 50 characters',
          },
        },
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'en',
        validate: {
          is: {
            args: /^[a-z]{2}(-[A-Z]{2})?$/,
            msg: 'Invalid language code format (e.g., en, en-US)',
          },
        },
        set(value) {
          // Automatically lowercase language code
          if (value) {
            this.setDataValue('language', value.toLowerCase().trim());
          }
        },
      },
    },
    {
      sequelize,
      modelName: 'Blog',
      tableName: 'blogs',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          fields: ['createdAt'],
          order: 'DESC',
        },
        {
          fields: ['author_id', 'createdAt'],
        },
      ],
      hooks: {
        beforeValidate: (blog) => {
          // Trim string fields
          if (blog.content) blog.content = blog.content.trim();
          if (blog.template) blog.template = blog.template.trim();
          if (blog.font) blog.font = blog.font.trim();
        },
      },
    }
  );

  return Blog;
};

/**
 * Define Model Associations
 * Sets up relationships between Blog and User models
 * 
 * @param {Object} models - Object containing all models
 */
const associateBlog = (models) => {
  const { User } = models;
  
  // A blog belongs to a user (author)
  Blog.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author',
  });
};

module.exports = { Blog, initBlogModel, associateBlog };
