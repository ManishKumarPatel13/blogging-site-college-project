import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, Sparkles } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { LoadingSpinner } from '../common/LoadingSpinner';

const AutoTagSuggestions = ({ content, selectedTags = [], onTagsChange, minContentLength = 100 }) => {
  const { generateTags } = useAI();
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchTags = useCallback(async () => {
    if (!content || content.length < minContentLength) {
      setSuggestedTags([]);
      return;
    }

    try {
      const response = await generateTags.mutateAsync({ content, maxTags: 8 });
      if (response.tags) {
        // Filter out already selected tags
        const newTags = response.tags.filter(
          (tag) => !selectedTags.includes(tag.toLowerCase())
        );
        setSuggestedTags(newTags);
      }
    } catch (error) {
      console.error('Failed to generate tags:', error);
    }
  }, [content, minContentLength, selectedTags, generateTags]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && content.length >= minContentLength && suggestedTags.length === 0) {
        fetchTags();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [content, minContentLength, fetchTags, suggestedTags.length]);

  const handleAddTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!selectedTags.includes(normalizedTag)) {
      onTagsChange([...selectedTags, normalizedTag]);
      setSuggestedTags((prev) => prev.filter((t) => t.toLowerCase() !== normalizedTag));
    }
  };

  const handleRemoveTag = (tag) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleRefresh = () => {
    setSuggestedTags([]);
    fetchTags();
  };

  const canGenerateTags = content && content.length >= minContentLength;

  return (
    <div className="space-y-3" data-testid="auto-tag-suggestions">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
        </div>
        {canGenerateTags && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={generateTags.isPending}
            className="flex items-center gap-1 text-xs text-ai-purple hover:text-ai-blue transition-colors"
            data-testid="generate-tags-btn"
          >
            {generateTags.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI Suggest
              </>
            )}
          </button>
        )}
      </div>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {selectedTags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge badge-primary flex items-center gap-1 pr-1"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Suggested Tags */}
      {suggestedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-lg bg-gradient-to-br from-ai-purple/5 to-ai-blue/5 border border-ai-purple/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ai-purple dark:text-ai-cyan flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Suggestions
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Show less' : 'Show all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(isExpanded ? suggestedTags : suggestedTags.slice(0, 5)).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="badge bg-white dark:bg-gray-800 border border-ai-purple/30 text-gray-700 dark:text-gray-300 hover:border-ai-purple hover:bg-ai-purple/10 transition-all flex items-center gap-1"
                data-testid={`suggested-tag-${tag}`}
              >
                <Plus className="w-3 h-3" />
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Helper Text */}
      {!canGenerateTags && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Write at least {minContentLength} characters to get AI tag suggestions.
        </p>
      )}

      {generateTags.isPending && (
        <div className="flex items-center gap-2 text-xs text-ai-purple">
          <LoadingSpinner size="sm" />
          Analyzing content for tags...
        </div>
      )}
    </div>
  );
};

export default AutoTagSuggestions;
