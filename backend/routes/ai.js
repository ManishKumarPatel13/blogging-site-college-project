/**
 * AI Routes
 * 
 * Provides AI-powered features for the blogging platform:
 * - Auto-tagging
 * - Writing assistance (expand, improve, continue, tone change)
 * - Title generation
 * - Content summarization
 * - Grammar checking
 * 
 * All routes require authentication.
 * 
 * @module routes/ai
 * @requires express
 * @requires ../services/aiService
 * @requires ../middleware/auth
 */

const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Get ContentModerationError for proper error handling
const { ContentModerationError } = aiService;

/**
 * Check if AI service is available
 */
const checkAIAvailable = (req, res, next) => {
  if (!aiService.isAvailable()) {
    return res.status(503).json({
      success: false,
      message: 'AI service is not configured. Please add GROQ_API_KEY to environment variables.',
    });
  }
  next();
};

/**
 * Error handler for AI routes - handles content moderation gracefully
 */
const handleAIError = (error, res, defaultMessage) => {
  console.error('AI Error:', error.message);
  
  // Handle content moderation errors with 422 status
  if (error instanceof ContentModerationError || error.code === 'CONTENT_MODERATED') {
    return res.status(422).json({
      success: false,
      message: error.message,
      code: 'CONTENT_MODERATED',
      hint: 'The AI has safety filters that prevent generating certain types of content. Please ensure your content is appropriate for all audiences.',
    });
  }
  
  // Handle service unavailable
  if (error.message === 'AI service temporarily unavailable') {
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily unavailable. Please try again later.',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
  
  // Generic error
  return res.status(500).json({
    success: false,
    message: defaultMessage || 'An error occurred while processing your request',
    error: error.message,
  });
};

// Apply middleware to all routes
router.use(auth);
router.use(checkAIAvailable);

/**
 * @route   POST /api/ai/tags
 * @desc    Generate tags from content
 * @access  Private
 * 
 * @body {string} content - The blog content to analyze
 * @body {number} maxTags - Maximum number of tags (default: 5, max: 10)
 * 
 * @returns {Object} { success: true, tags: string[] }
 */
router.post('/tags', async (req, res) => {
  try {
    const { content, maxTags = 5 } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for tag generation',
      });
    }

    if (content.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 50 characters for accurate tagging',
      });
    }

    const tags = await aiService.generateTags(content, Math.min(maxTags, 10));

    res.json({
      success: true,
      tags,
      count: tags.length,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to generate tags');
  }
});

/**
 * @route   POST /api/ai/summary
 * @desc    Generate a summary of content
 * @access  Private
 * 
 * @body {string} content - The blog content to summarize
 * @body {string} length - 'short', 'medium', or 'long' (default: 'short')
 * 
 * @returns {Object} { success: true, summary: string }
 */
router.post('/summary', async (req, res) => {
  try {
    const { content, length = 'short' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for summarization',
      });
    }

    if (!['short', 'medium', 'long'].includes(length)) {
      return res.status(400).json({
        success: false,
        message: 'Length must be "short", "medium", or "long"',
      });
    }

    const summary = await aiService.generateSummary(content, length);

    res.json({
      success: true,
      summary,
      length,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to generate summary');
  }
});

/**
 * @route   POST /api/ai/titles
 * @desc    Generate title suggestions
 * @access  Private
 * 
 * @body {string} content - The blog content
 * @body {number} count - Number of titles to generate (default: 5, max: 10)
 * 
 * @returns {Object} { success: true, titles: string[] }
 */
router.post('/titles', async (req, res) => {
  try {
    const { content, count = 5 } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for title generation',
      });
    }

    const titles = await aiService.generateTitles(content, Math.min(count, 10));

    res.json({
      success: true,
      titles,
      count: titles.length,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to generate titles');
  }
});

/**
 * @route   POST /api/ai/expand
 * @desc    Expand text into fuller content
 * @access  Private
 * 
 * @body {string} text - The text to expand
 * @body {string} tone - 'professional', 'casual', 'academic' (default: 'professional')
 * 
 * @returns {Object} { success: true, expanded: string }
 */
router.post('/expand', async (req, res) => {
  try {
    const { text, tone = 'professional' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for expansion',
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Text must be under 2000 characters for expansion',
      });
    }

    const expanded = await aiService.expandText(text, tone);

    res.json({
      success: true,
      expanded,
      originalLength: text.length,
      expandedLength: expanded.length,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to expand text');
  }
});

/**
 * @route   POST /api/ai/improve
 * @desc    Improve text for clarity, grammar, and style
 * @access  Private
 * 
 * @body {string} text - The text to improve
 * 
 * @returns {Object} { success: true, improved: string, changes: string[] }
 */
router.post('/improve', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for improvement',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Text must be under 5000 characters',
      });
    }

    const result = await aiService.improveText(text);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to improve text');
  }
});

/**
 * @route   POST /api/ai/tone
 * @desc    Change the tone of text
 * @access  Private
 * 
 * @body {string} text - The text to rewrite
 * @body {string} targetTone - 'professional', 'casual', 'academic', 'friendly', 'formal'
 * 
 * @returns {Object} { success: true, rewritten: string }
 */
router.post('/tone', async (req, res) => {
  try {
    const { text, targetTone } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const validTones = ['professional', 'casual', 'academic', 'friendly', 'formal'];
    if (!targetTone || !validTones.includes(targetTone)) {
      return res.status(400).json({
        success: false,
        message: `Target tone must be one of: ${validTones.join(', ')}`,
      });
    }

    if (text.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Text must be under 3000 characters',
      });
    }

    const rewritten = await aiService.changeTone(text, targetTone);

    res.json({
      success: true,
      rewritten,
      targetTone,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to change tone');
  }
});

/**
 * @route   POST /api/ai/continue
 * @desc    Continue writing from where the user left off
 * @access  Private
 * 
 * @body {string} text - The text to continue from
 * @body {number} sentences - Number of sentences to add (default: 3, max: 10)
 * 
 * @returns {Object} { success: true, continuation: string }
 */
router.post('/continue', async (req, res) => {
  try {
    const { text, sentences = 3 } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for continuation',
      });
    }

    if (text.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 20 characters for context',
      });
    }

    const continuation = await aiService.continueWriting(text, Math.min(sentences, 10));

    res.json({
      success: true,
      continuation,
      sentences: Math.min(sentences, 10),
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to continue writing');
  }
});

/**
 * @route   POST /api/ai/grammar
 * @desc    Check and correct grammar/spelling
 * @access  Private
 * 
 * @body {string} text - The text to check
 * 
 * @returns {Object} { success: true, corrected: string, errors: Array }
 */
router.post('/grammar', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for grammar check',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Text must be under 5000 characters',
      });
    }

    const result = await aiService.grammarCheck(text);

    res.json({
      success: true,
      ...result,
      errorCount: result.errors?.length || 0,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to check grammar');
  }
});

/**
 * @route   POST /api/ai/category
 * @desc    Classify content into a category
 * @access  Private
 * 
 * @body {string} content - The content to classify
 * 
 * @returns {Object} { success: true, category: string }
 */
router.post('/category', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for classification',
      });
    }

    const category = await aiService.getCategory(content);

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to classify content');
  }
});

/**
 * @route   POST /api/ai/analyze
 * @desc    Full analysis: tags, summary, category, title suggestions
 * @access  Private
 * 
 * @body {string} content - The blog content to analyze
 * 
 * @returns {Object} { success: true, tags, summary, category, titles }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for analysis',
      });
    }

    if (content.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 100 characters for full analysis',
      });
    }

    // Run all analyses in parallel for speed
    const [tags, summary, category, titles] = await Promise.all([
      aiService.generateTags(content, 5),
      aiService.generateSummary(content, 'short'),
      aiService.getCategory(content),
      aiService.generateTitles(content, 3),
    ]);

    res.json({
      success: true,
      analysis: {
        tags,
        summary,
        category,
        titles,
      },
    });
  } catch (error) {
    handleAIError(error, res, 'Failed to analyze content');
  }
});

/**
 * @route   GET /api/ai/status
 * @desc    Check AI service status
 * @access  Private
 * 
 * @returns {Object} { success: true, available: boolean, models: string[] }
 */
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    available: aiService.isAvailable(),
    models: Object.keys(aiService.MODELS),
    features: [
      'tags',
      'summary', 
      'titles',
      'expand',
      'improve',
      'tone',
      'continue',
      'grammar',
      'category',
      'analyze',
    ],
  });
});

module.exports = router;
