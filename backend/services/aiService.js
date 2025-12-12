/**
 * AI Service Module
 * 
 * Provides AI-powered features using Groq's free API:
 * - Writing Assistant (expand, improve, summarize text)
 * - Auto-tagging (extract relevant tags from content)
 * - Title Generation (suggest catchy titles)
 * - Grammar & Style Check
 * 
 * @module services/aiService
 * @requires groq-sdk
 */

const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model configuration (using free models)
const MODELS = {
  FAST: 'llama-3.1-8b-instant',        // Ultra fast, good for quick tasks
  BALANCED: 'llama-3.3-70b-versatile', // Best quality, still free (updated model)
  MIXTRAL: 'mixtral-8x7b-32768',       // Good for longer content
};

// Fallback model if primary fails
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

// Content moderation keywords that indicate a refusal
const REFUSAL_PATTERNS = [
  /i cannot|i can't|i'm unable|i am unable/i,
  /i will not|i won't/i,
  /inappropriate|offensive|harmful/i,
  /against my guidelines|violates.*policy/i,
  /as an ai|as a language model/i,
  /i'm not able to|i am not able to/i,
  /cannot assist with|can't help with/i,
  /explicit|adult content|nsfw/i,
];

/**
 * Check if response indicates content moderation refusal
 * @private
 */
const isContentRefusal = (response) => {
  if (!response || response.length < 10) return false;
  
  // Check first 200 chars for refusal patterns
  const checkText = response.substring(0, 200).toLowerCase();
  return REFUSAL_PATTERNS.some(pattern => pattern.test(checkText));
};

/**
 * Custom error class for content moderation
 */
class ContentModerationError extends Error {
  constructor(message = 'Content was flagged by AI safety filters') {
    super(message);
    this.name = 'ContentModerationError';
    this.code = 'CONTENT_MODERATED';
  }
}

/**
 * Make a completion request to Groq
 * @private
 */
const makeCompletion = async (systemPrompt, userPrompt, model = MODELS.FAST) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Check if AI refused to generate content
    if (isContentRefusal(response)) {
      throw new ContentModerationError(
        'The AI could not process this content due to safety guidelines. Please ensure your content is appropriate and try again.'
      );
    }

    return response;
  } catch (error) {
    // Re-throw content moderation errors
    if (error instanceof ContentModerationError) {
      throw error;
    }
    
    // Check for API-level content filtering
    if (error.message?.includes('content_filter') || 
        error.message?.includes('moderation') ||
        error.code === 'content_policy_violation') {
      throw new ContentModerationError(
        'Your content was flagged by safety filters. Please modify your content and try again.'
      );
    }
    
    console.error(`Groq API Error with model ${model}:`, error.message);
    
    // Try fallback model if primary fails
    if (model !== FALLBACK_MODEL) {
      console.log(`Retrying with fallback model: ${FALLBACK_MODEL}`);
      try {
        const fallbackCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: FALLBACK_MODEL,
          temperature: 0.7,
          max_tokens: 1024,
        });
        
        const fallbackResponse = fallbackCompletion.choices[0]?.message?.content || '';
        
        // Check fallback response for refusal
        if (isContentRefusal(fallbackResponse)) {
          throw new ContentModerationError(
            'The AI could not process this content due to safety guidelines. Please ensure your content is appropriate and try again.'
          );
        }
        
        return fallbackResponse;
      } catch (fallbackError) {
        if (fallbackError instanceof ContentModerationError) {
          throw fallbackError;
        }
        console.error('Fallback model also failed:', fallbackError.message);
        throw new Error('AI service temporarily unavailable');
      }
    }
    
    throw new Error('AI service temporarily unavailable');
  }
};

// Export ContentModerationError for use in routes
module.exports.ContentModerationError = ContentModerationError;

/**
 * Generate auto-tags from blog content
 * 
 * @param {string} content - Blog content to analyze
 * @param {number} maxTags - Maximum number of tags (default: 5)
 * @returns {Promise<string[]>} Array of relevant tags
 */
const generateTags = async (content, maxTags = 5) => {
  const systemPrompt = `You are a content tagging expert. Extract the most relevant tags from the given blog content.

Rules:
- Return ONLY a JSON array of strings, no explanation
- Tags should be lowercase, single words or short phrases
- Maximum ${maxTags} tags
- Focus on main topics, technologies, concepts
- Make tags SEO-friendly and searchable

Example output: ["javascript", "web development", "react", "frontend", "tutorial"]`;

  const userPrompt = `Extract tags from this blog content:\n\n${content.substring(0, 3000)}`;

  try {
    const response = await makeCompletion(systemPrompt, userPrompt, MODELS.FAST);
    
    // Parse JSON response
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0]);
      return tags.slice(0, maxTags).map(tag => tag.toLowerCase().trim());
    }
    
    return [];
  } catch (error) {
    console.error('Tag generation error:', error);
    return [];
  }
};

/**
 * Generate a summary of the blog content
 * 
 * @param {string} content - Blog content to summarize
 * @param {string} length - 'short' (1-2 sentences), 'medium' (paragraph), 'long' (detailed)
 * @returns {Promise<string>} Generated summary
 */
const generateSummary = async (content, length = 'short') => {
  const lengthInstructions = {
    short: '1-2 sentences, under 50 words',
    medium: 'A paragraph, around 100 words',
    long: 'Detailed summary, around 200 words',
  };

  const systemPrompt = `You are a content summarizer. Create a ${length} summary.

Rules:
- Length: ${lengthInstructions[length] || lengthInstructions.short}
- Capture the main points and key takeaways
- Write in third person
- Be concise and informative
- Return ONLY the summary text, no labels or prefixes`;

  const userPrompt = `Summarize this blog content:\n\n${content.substring(0, 4000)}`;

  return makeCompletion(systemPrompt, userPrompt, MODELS.FAST);
};

/**
 * Generate title suggestions for blog content
 * 
 * @param {string} content - Blog content
 * @param {number} count - Number of title suggestions (default: 5)
 * @returns {Promise<string[]>} Array of title suggestions
 */
const generateTitles = async (content, count = 5) => {
  const systemPrompt = `You are a headline expert. Generate catchy, SEO-optimized blog titles.

Rules:
- Return ONLY a JSON array of strings
- Generate exactly ${count} different title options
- Titles should be engaging and click-worthy
- Keep titles under 70 characters
- Use power words and numbers when appropriate
- Vary the style (question, how-to, listicle, etc.)

Example output: ["10 Ways to Master JavaScript", "The Ultimate Guide to Web Development", "Why React is Taking Over in 2024"]`;

  const userPrompt = `Generate ${count} title options for this blog:\n\n${content.substring(0, 2000)}`;

  try {
    const response = await makeCompletion(systemPrompt, userPrompt, MODELS.FAST);
    
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).slice(0, count);
    }
    
    return [];
  } catch (error) {
    console.error('Title generation error:', error);
    return [];
  }
};

/**
 * Writing Assistant - Expand text
 * Expands short content into a fuller paragraph
 * 
 * @param {string} text - Text to expand
 * @param {string} tone - 'professional', 'casual', 'academic'
 * @returns {Promise<string>} Expanded text
 */
const expandText = async (text, tone = 'professional') => {
  const systemPrompt = `You are a writing assistant. Expand the given text into a fuller, more detailed version.

Rules:
- Maintain the original meaning and intent
- Use a ${tone} tone
- Add relevant details, examples, or explanations
- Double or triple the length naturally
- Return ONLY the expanded text, no labels`;

  return makeCompletion(systemPrompt, text, MODELS.BALANCED);
};

/**
 * Writing Assistant - Improve text
 * Improves grammar, clarity, and style
 * 
 * @param {string} text - Text to improve
 * @returns {Promise<Object>} { improved: string, changes: string[] }
 */
const improveText = async (text) => {
  const systemPrompt = `You are a professional editor. Improve the given text for clarity, grammar, and style.

Return a JSON object with:
- "improved": the improved version of the text
- "changes": array of changes made (max 5)

Example output:
{
  "improved": "The improved text here...",
  "changes": ["Fixed grammar in sentence 2", "Improved clarity", "Added transition words"]
}`;

  try {
    const response = await makeCompletion(systemPrompt, text, MODELS.BALANCED);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { improved: text, changes: [] };
  } catch (error) {
    console.error('Text improvement error:', error);
    return { improved: text, changes: [] };
  }
};

/**
 * Writing Assistant - Change tone
 * Rewrites text in a different tone
 * 
 * @param {string} text - Original text
 * @param {string} targetTone - 'professional', 'casual', 'academic', 'friendly', 'formal'
 * @returns {Promise<string>} Rewritten text
 */
const changeTone = async (text, targetTone) => {
  const systemPrompt = `You are a writing assistant. Rewrite the given text in a ${targetTone} tone.

Rules:
- Keep the same meaning and information
- Adjust vocabulary and sentence structure for the ${targetTone} tone
- Return ONLY the rewritten text`;

  return makeCompletion(systemPrompt, text, MODELS.FAST);
};

/**
 * Writing Assistant - Complete/Continue text
 * Continues writing from where the user left off
 * 
 * @param {string} text - Text to continue from
 * @param {number} sentences - Number of sentences to add (default: 3)
 * @returns {Promise<string>} Continuation text
 */
const continueWriting = async (text, sentences = 3) => {
  const systemPrompt = `You are a writing assistant. Continue the given text naturally.

Rules:
- Add approximately ${sentences} more sentences
- Match the existing writing style and tone
- Continue the thought or topic logically
- Return ONLY the continuation (not the original text)`;

  return makeCompletion(systemPrompt, text, MODELS.BALANCED);
};

/**
 * Grammar and spell check
 * 
 * @param {string} text - Text to check
 * @returns {Promise<Object>} { corrected: string, errors: Array<{original, correction, type}> }
 */
const grammarCheck = async (text) => {
  const systemPrompt = `You are a grammar and spelling checker. Analyze the text for errors.

Return a JSON object with:
- "corrected": the corrected text
- "errors": array of errors found, each with:
  - "original": the incorrect text
  - "correction": the fix
  - "type": "grammar" | "spelling" | "punctuation" | "style"

If no errors found, return empty errors array.

Example:
{
  "corrected": "The cat sat on the mat.",
  "errors": [{"original": "sitted", "correction": "sat", "type": "grammar"}]
}`;

  try {
    const response = await makeCompletion(systemPrompt, text, MODELS.FAST);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { corrected: text, errors: [] };
  } catch (error) {
    console.error('Grammar check error:', error);
    return { corrected: text, errors: [] };
  }
};

/**
 * Get content category
 * Classifies content into predefined categories
 * 
 * @param {string} content - Content to classify
 * @returns {Promise<string>} Category name
 */
const getCategory = async (content) => {
  const categories = [
    'Technology', 'Programming', 'Web Development', 'Mobile Development',
    'Data Science', 'AI/Machine Learning', 'DevOps', 'Cybersecurity',
    'Business', 'Marketing', 'Design', 'Lifestyle', 'Travel', 'Food',
    'Health', 'Education', 'Finance', 'Entertainment', 'Sports', 'Other'
  ];

  const systemPrompt = `You are a content classifier. Classify the given content into ONE of these categories:
${categories.join(', ')}

Rules:
- Return ONLY the category name, nothing else
- Choose the most relevant category
- If unsure, use "Other"`;

  const userPrompt = `Classify this content:\n\n${content.substring(0, 2000)}`;

  try {
    const response = await makeCompletion(systemPrompt, userPrompt, MODELS.FAST);
    const category = response.trim();
    
    // Validate it's one of our categories
    const match = categories.find(c => 
      c.toLowerCase() === category.toLowerCase()
    );
    
    return match || 'Other';
  } catch (error) {
    console.error('Category classification error:', error);
    return 'Other';
  }
};

/**
 * Check if AI service is available
 * @returns {boolean}
 */
const isAvailable = () => {
  return !!process.env.GROQ_API_KEY;
};

module.exports = {
  generateTags,
  generateSummary,
  generateTitles,
  expandText,
  improveText,
  changeTone,
  continueWriting,
  grammarCheck,
  getCategory,
  isAvailable,
  MODELS,
};
