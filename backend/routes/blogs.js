/**
 * Blog Routes
 * 
 * This module handles all blog-related endpoints including:
 * - CRUD operations for blog posts (Create, Read, Update, Delete)
 * - Fetching blogs by author
 * - Public and private blog access
 * 
 * @module routes/blogs
 * @requires express
 * @requires ../models
 * @requires ../middleware/auth
 */

const express = require('express');
const { Blog, User } = require('../models');
const auth = require('../middleware/auth');

// AI service for auto-tagging (optional, gracefully fails if not configured)
let aiService;
try {
  aiService = require('../services/aiService');
} catch (e) {
  console.log('AI service not available');
}

const router = express.Router();

/**
 * Validate Blog Input
 * Helper function to validate blog post data
 * 
 * @param {Object} data - Blog data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 * @private
 */
const validateBlogInput = (data) => {
  const errors = [];
  
  // Content validation
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Blog content cannot be empty');
  } else if (data.content.length > 50000) {
    errors.push('Blog content cannot exceed 50,000 characters');
  }
  
  // Media validation
  if (data.media && Array.isArray(data.media)) {
    const urlRegex = /^https?:\/\/.+/;
    data.media.forEach((url, index) => {
      if (!urlRegex.test(url)) {
        errors.push(`Media URL at index ${index} is invalid`);
      }
    });
  }
  
  // Language validation
  if (data.language) {
    const langRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!langRegex.test(data.language)) {
      errors.push('Language code must be in format: en or en-US');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * @route   GET /api/blogs
 * @desc    Get all blog posts with pagination and filtering
 * @access  Public
 * 
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Number of blogs per page (default: 10, max: 50)
 * @query {string} author - Filter by author ID
 * @query {string} sort - Sort order: 'latest' or 'oldest' (default: 'latest')
 * 
 * @returns {Object} 200 - { blogs: Array, pagination: Object }
 * @returns {Object} 400 - { message: string } - Invalid query parameters
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/', async (req, res) => {
  try {
    // Parse query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const skip = (page - 1) * limit;
    const sort = req.query.sort === 'oldest' ? 1 : -1;
    
    // Build filter
    const filter = {};
    if (req.query.author) {
      filter.authorId = req.query.author;
    }

    // Get total count for pagination
    const totalBlogs = await Blog.count({ where: filter });
    const totalPages = Math.ceil(totalBlogs / limit);

    // Fetch blogs with pagination
    const blogs = await Blog.findAll({
      where: filter,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email']
      }],
      order: [['createdAt', sort === 1 ? 'ASC' : 'DESC']],
      offset: skip,
      limit: limit
    });

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        blogsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/blogs/recent
 * @desc    Get recent blog posts (optimized endpoint)
 * @access  Public
 * 
 * @query {number} limit - Number of blogs to return (default: 10, max: 20)
 * 
 * @returns {Object} 200 - { blogs: Array }
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const blogs = await Blog.getRecentBlogs(limit);
    
    res.json({ blogs });
  } catch (error) {
    console.error('Get recent blogs error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching recent blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/blogs/:id
 * @desc    Get a single blog post by ID
 * @access  Public
 * 
 * @param {string} id - Blog post ID
 * 
 * @returns {Object} 200 - Blog post data with author details
 * @returns {Object} 404 - { message: string } - Blog not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email', 'gender']
      }]
    });
    
    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog post not found' 
      });
    }

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    
    res.status(500).json({ 
      message: 'Server error while fetching blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post
 * @access  Private (requires authentication)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @body {string} content - Blog post content (required, max 50,000 chars)
 * @body {string[]} media - Array of media URLs (optional)
 * @body {string} template - Template name (optional, default: 'default')
 * @body {string} font - Font family (optional, default: 'Arial')
 * @body {string} language - Language code (optional, default: 'en')
 * 
 * @returns {Object} 201 - Created blog post data
 * @returns {Object} 400 - { message: string, errors: Array } - Validation errors
 * @returns {Object} 401 - { message: string } - Unauthorized
 * @returns {Object} 500 - { message: string } - Server error
 */
router.post('/', auth, async (req, res) => {
  try {
    const { content, media, template, font, language, title, tags, autoTag = true } = req.body;

    // Validate input
    const validation = validateBlogInput({ content, media, language });
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Auto-generate tags, summary, and category if AI is available and autoTag is enabled
    let generatedTags = tags || [];
    let generatedSummary = null;
    let generatedCategory = 'Other';
    let aiGenerated = false;

    if (autoTag && aiService && aiService.isAvailable() && content.length >= 100) {
      try {
        // Run AI analysis in parallel
        const [aiTags, aiSummary, aiCategory] = await Promise.all([
          tags && tags.length > 0 ? Promise.resolve(tags) : aiService.generateTags(content, 5),
          aiService.generateSummary(content, 'short'),
          aiService.getCategory(content),
        ]);
        
        generatedTags = aiTags;
        generatedSummary = aiSummary;
        generatedCategory = aiCategory;
        aiGenerated = true;
      } catch (aiError) {
        console.log('AI auto-tagging failed, continuing without:', aiError.message);
      }
    }

    // Create new blog post
    const blog = await Blog.create({
      content: content.trim(),
      media: media && Array.isArray(media) ? media : [],
      template: template || 'default',
      font: font || 'Arial',
      language: language || 'en',
      authorId: req.user.id,
      title: title || null,
      tags: generatedTags,
      summary: generatedSummary,
      category: generatedCategory,
      aiGenerated,
    });
    
    // Fetch blog with author details
    const blogWithAuthor = await Blog.findByPk(blog.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email']
      }]
    });

    res.status(201).json({
      message: 'Blog post created successfully',
      blog: blogWithAuthor,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors ? error.errors.map(e => e.message) : [error.message];
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update an existing blog post
 * @access  Private (requires authentication and ownership)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @param {string} id - Blog post ID
 * @body {string} content - Updated blog content (optional)
 * @body {string[]} media - Updated media URLs (optional)
 * @body {string} template - Updated template (optional)
 * @body {string} font - Updated font (optional)
 * @body {string} language - Updated language (optional)
 * 
 * @returns {Object} 200 - { message: string, blog: Object }
 * @returns {Object} 400 - { message: string, errors: Array } - Validation errors
 * @returns {Object} 401 - { message: string } - Unauthorized (not the owner)
 * @returns {Object} 404 - { message: string } - Blog not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, media, template, font, language } = req.body;

    // Find blog post
    let blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog post not found' 
      });
    }

    // Check if user is the author of this blog
    if (blog.authorId !== req.user.id) {
      return res.status(401).json({ 
        message: 'You are not authorized to update this blog post' 
      });
    }

    // Validate input if provided
    if (content || media || language) {
      const validation = validateBlogInput({ 
        content: content || blog.content, 
        media: media || blog.media,
        language: language || blog.language
      });
      
      if (!validation.valid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors
        });
      }
    }

    // Update fields
    if (content !== undefined) blog.content = content.trim();
    if (media !== undefined) blog.media = Array.isArray(media) ? media : [];
    if (template !== undefined) blog.template = template;
    if (font !== undefined) blog.font = font;
    if (language !== undefined) blog.language = language;

    // Save updated blog
    await blog.save();
    
    // Fetch blog with author details
    const blogWithAuthor = await Blog.findByPk(blog.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email']
      }]
    });

    res.json({
      message: 'Blog post updated successfully',
      blog: blogWithAuthor,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors ? error.errors.map(e => e.message) : [error.message];
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while updating blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post
 * @access  Private (requires authentication and ownership)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @param {string} id - Blog post ID
 * 
 * @returns {Object} 200 - { message: string }
 * @returns {Object} 401 - { message: string } - Unauthorized (not the owner)
 * @returns {Object} 404 - { message: string } - Blog not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find blog post
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog post not found' 
      });
    }

    // Check if user is the author of this blog
    if (blog.authorId !== req.user.id) {
      return res.status(401).json({ 
        message: 'You are not authorized to delete this blog post' 
      });
    }

    // Delete blog post
    await blog.destroy();

    res.json({ 
      message: 'Blog post deleted successfully' 
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    
    res.status(500).json({ 
      message: 'Server error while deleting blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/blogs/user/:userId
 * @desc    Get all blog posts by a specific user
 * @access  Public
 * 
 * @param {string} userId - User ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Blogs per page (default: 10, max: 50)
 * 
 * @returns {Object} 200 - { blogs: Array, pagination: Object, author: Object }
 * @returns {Object} 404 - { message: string } - User not found
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/user/:userId', async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(req.params.userId, {
      attributes: ['id', 'name', 'nickname', 'email']
    });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get total count
    const totalBlogs = await Blog.count({ where: { authorId: req.params.userId } });
    const totalPages = Math.ceil(totalBlogs / limit);

    // Fetch user's blogs
    const blogs = await Blog.findAll({
      where: { authorId: req.params.userId },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email']
      }],
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit: limit
    });

    res.json({
      blogs,
      author: user,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        blogsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    
    res.status(500).json({ 
      message: 'Server error while fetching user blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/blogs/my/posts
 * @desc    Get all blog posts created by authenticated user
 * @access  Private (requires authentication)
 * 
 * @header {string} Authorization - Bearer token (required)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Blogs per page (default: 10, max: 50)
 * 
 * @returns {Object} 200 - { blogs: Array, pagination: Object }
 * @returns {Object} 401 - { message: string } - Unauthorized
 * @returns {Object} 500 - { message: string } - Server error
 */
router.get('/my/posts', auth, async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Get total count
    const totalBlogs = await Blog.count({ where: { authorId: req.user.id } });
    const totalPages = Math.ceil(totalBlogs / limit);

    // Fetch user's blogs
    const blogs = await Blog.findAll({
      where: { authorId: req.user.id },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'nickname', 'email']
      }],
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit: limit
    });

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        blogsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching your blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
