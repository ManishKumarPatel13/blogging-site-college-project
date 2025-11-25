import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  ArrowUpRight,
  Languages,
  PenLine,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { AILoadingState } from '../common/LoadingSpinner';
import { AIErrorDisplay } from '../common/ErrorBoundary';

const AIWritingAssistant = ({ selectedText, position, onApply, onClose }) => {
  const { expandText, improveText, changeTone, continueWriting } = useAI();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const panelRef = useRef(null);

  const isLoading =
    expandText.isPending ||
    improveText.isPending ||
    changeTone.isPending ||
    continueWriting.isPending;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = async (action, params = {}) => {
    setError(null);
    setResult(null);
    setActiveAction(action);

    try {
      let response;
      switch (action) {
        case 'expand':
          response = await expandText.mutateAsync({ text: selectedText, tone: params.tone || 'casual' });
          setResult({ type: 'expand', content: response.expanded });
          break;
        case 'improve':
          response = await improveText.mutateAsync({ text: selectedText });
          setResult({ type: 'improve', content: response.improved, changes: response.changes });
          break;
        case 'tone':
          response = await changeTone.mutateAsync({ text: selectedText, targetTone: params.targetTone });
          setResult({ type: 'tone', content: response.rewritten, tone: params.targetTone });
          break;
        case 'continue':
          response = await continueWriting.mutateAsync({ text: selectedText, sentences: 3 });
          setResult({ type: 'continue', content: response.continuation });
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (result?.content) {
      onApply(result.content);
      onClose();
    }
  };

  const actions = [
    { id: 'expand', label: 'Expand', icon: ArrowUpRight, description: 'Make it longer' },
    { id: 'improve', label: 'Improve', icon: Wand2, description: 'Fix & enhance' },
    {
      id: 'tone',
      label: 'Professional',
      icon: Languages,
      description: 'Formal tone',
      params: { targetTone: 'professional' },
    },
    {
      id: 'tone-casual',
      label: 'Casual',
      icon: Languages,
      description: 'Friendly tone',
      params: { targetTone: 'casual' },
      action: 'tone',
    },
    { id: 'continue', label: 'Continue', icon: PenLine, description: 'Keep writing' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        style={{
          position: 'fixed',
          left: position?.x || '50%',
          top: position?.y || '50%',
          transform: 'translate(-50%, 0)',
          zIndex: 100,
        }}
        className="w-80 card shadow-xl border-ai-purple/20"
        data-testid="ai-writing-assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-purple to-ai-blue flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">AI Assistant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Selected Text Preview */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected text:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {selectedText}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-3">
          {isLoading && (
            <AILoadingState
              message={
                activeAction === 'expand'
                  ? 'Expanding text...'
                  : activeAction === 'improve'
                  ? 'Improving writing...'
                  : activeAction === 'tone'
                  ? 'Changing tone...'
                  : 'Continuing writing...'
              }
            />
          )}

          {error && <AIErrorDisplay error={error} onRetry={() => handleAction(activeAction)} />}

          {result && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-ai-purple/5 to-ai-blue/5 border border-ai-purple/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">{result.content}</p>
                {result.changes && (
                  <div className="mt-2 pt-2 border-t border-ai-purple/10">
                    <p className="text-xs text-gray-500">Changes made:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside">
                      {result.changes.slice(0, 3).map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 btn-ai text-sm"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          {!result && !isLoading && !error && (
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => handleAction(action.action || action.id, action.params)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ai-purple dark:hover:border-ai-purple hover:bg-ai-purple/5 transition-all text-left"
                    data-testid={`ai-action-${action.id}`}
                  >
                    <Icon className="w-5 h-5 text-ai-purple" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIWritingAssistant;
