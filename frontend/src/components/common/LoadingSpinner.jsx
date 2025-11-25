import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2 
      className={`animate-spin text-primary-600 ${sizeClasses[size]} ${className}`}
      data-testid="loading-spinner"
    />
  );
};

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]" data-testid="page-loader">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <LoadingSpinner size="xl" />
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </motion.div>
    </div>
  );
};

export const AILoadingState = ({ message = 'AI is thinking...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-ai-purple/10 to-ai-blue/10 border border-ai-purple/20"
      data-testid="ai-loading-state"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-ai-purple to-ai-blue animate-pulse-slow" />
        <motion.div
          className="absolute inset-0 w-8 h-8 rounded-full border-2 border-ai-purple/50"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ai-purple dark:text-ai-cyan">{message}</p>
        <div className="h-1 mt-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-ai-purple to-ai-blue"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
