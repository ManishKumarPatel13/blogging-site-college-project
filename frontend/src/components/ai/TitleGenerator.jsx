import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Check, RefreshCw, Type } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { LoadingSpinner } from '../common/LoadingSpinner';

const TitleGenerator = ({ content, value, onChange, minContentLength = 100 }) => {
  const { generateTitles } = useAI();
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateTitles = async () => {
    if (!content || content.length < minContentLength) return;

    try {
      const response = await generateTitles.mutateAsync({ content, count: 5 });
      if (response.titles) {
        setSuggestions(response.titles);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to generate titles:', error);
    }
  };

  const handleSelectTitle = (title) => {
    onChange(title);
    setIsOpen(false);
  };

  const canGenerateTitles = content && content.length >= minContentLength;

  return (
    <div className="space-y-2" data-testid="title-generator">
      {/* Input with AI Button */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
        </div>
        <div className="relative mt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your blog title..."
            className="input pr-24"
            data-testid="title-input"
          />
          <button
            type="button"
            onClick={handleGenerateTitles}
            disabled={!canGenerateTitles || generateTitles.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-ai-purple to-ai-blue text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-ai-purple/90 hover:to-ai-blue/90 transition-all"
            data-testid="generate-titles-btn"
          >
            {generateTitles.isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI Title
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card border-ai-purple/20 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-ai-purple/5 to-ai-blue/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ai-purple dark:text-ai-cyan flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Title Suggestions
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleGenerateTitles}
                    disabled={generateTitles.isPending}
                    className="p-1 rounded hover:bg-ai-purple/10 transition-colors"
                    title="Generate more"
                  >
                    <RefreshCw className={`w-3 h-3 text-ai-purple ${generateTitles.isPending ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((title, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleSelectTitle(title)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2 ${
                    value === title ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  data-testid={`title-suggestion-${index}`}
                >
                  <span className="w-5 h-5 rounded-full bg-ai-purple/10 text-ai-purple text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{title}</span>
                  {value === title && <Check className="w-4 h-4 text-primary-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      {!canGenerateTitles && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Write at least {minContentLength} characters to get AI title suggestions.
        </p>
      )}
    </div>
  );
};

export default TitleGenerator;
