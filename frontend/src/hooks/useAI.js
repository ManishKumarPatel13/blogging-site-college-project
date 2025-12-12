import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useAI = () => {
  const handleError = (error, action) => {
    const message = error.response?.data?.message || `Failed to ${action}`;
    if (message.includes('not configured') || message.includes('GROQ_API_KEY')) {
      toast.error('AI service is not available. Please contact support.');
    } else if (message.includes('Content must be at least')) {
      toast.error(message);
    } else {
      toast.error(message);
    }
  };

  const generateTags = useMutation({
    mutationFn: ({ content, maxTags }) => aiAPI.generateTags(content, maxTags).then(res => res.data),
    onError: (error) => handleError(error, 'generate tags'),
  });

  const generateSummary = useMutation({
    mutationFn: ({ content, length }) => aiAPI.generateSummary(content, length).then(res => res.data),
    onError: (error) => handleError(error, 'generate summary'),
  });

  const generateTitles = useMutation({
    mutationFn: ({ content, count }) => aiAPI.generateTitles(content, count).then(res => res.data),
    onError: (error) => handleError(error, 'generate titles'),
  });

  const expandText = useMutation({
    mutationFn: ({ text, tone }) => aiAPI.expandText(text, tone).then(res => res.data),
    onError: (error) => handleError(error, 'expand text'),
  });

  const improveText = useMutation({
    mutationFn: ({ text }) => aiAPI.improveText(text).then(res => res.data),
    onError: (error) => handleError(error, 'improve text'),
  });

  const changeTone = useMutation({
    mutationFn: ({ text, targetTone }) => aiAPI.changeTone(text, targetTone).then(res => res.data),
    onError: (error) => handleError(error, 'change tone'),
  });

  const continueWriting = useMutation({
    mutationFn: ({ text, sentences }) => aiAPI.continueWriting(text, sentences).then(res => res.data),
    onError: (error) => handleError(error, 'continue writing'),
  });

  const checkGrammar = useMutation({
    mutationFn: ({ text }) => aiAPI.checkGrammar(text).then(res => res.data),
    onError: (error) => handleError(error, 'check grammar'),
  });

  const classifyCategory = useMutation({
    mutationFn: ({ content }) => aiAPI.classifyCategory(content).then(res => res.data),
    onError: (error) => handleError(error, 'classify category'),
  });

  const fullAnalysis = useMutation({
    mutationFn: ({ content }) => aiAPI.fullAnalysis(content).then(res => res.data),
    onError: (error) => handleError(error, 'analyze content'),
  });

  const isAnyLoading = 
    generateTags.isPending ||
    generateSummary.isPending ||
    generateTitles.isPending ||
    expandText.isPending ||
    improveText.isPending ||
    changeTone.isPending ||
    continueWriting.isPending ||
    checkGrammar.isPending ||
    classifyCategory.isPending ||
    fullAnalysis.isPending;

  return {
    generateTags,
    generateSummary,
    generateTitles,
    expandText,
    improveText,
    changeTone,
    continueWriting,
    checkGrammar,
    classifyCategory,
    fullAnalysis,
    isAnyLoading,
  };
};
