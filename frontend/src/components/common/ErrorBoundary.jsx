import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8" data-testid="error-boundary">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                to="/"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AIErrorDisplay = ({ error, onRetry }) => {
  const isContentModerated = error?.includes('moderat') || error?.includes('CONTENT_MODERATED');

  return (
    <div
      className={`p-4 rounded-lg border ${
        isContentModerated
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}
      data-testid="ai-error-display"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 mt-0.5 ${
            isContentModerated ? 'text-yellow-600' : 'text-red-600'
          }`}
        />
        <div className="flex-1">
          <h4
            className={`font-medium ${
              isContentModerated
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {isContentModerated ? 'Content Notice' : 'AI Error'}
          </h4>
          <p
            className={`text-sm mt-1 ${
              isContentModerated
                ? 'text-yellow-700 dark:text-yellow-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {isContentModerated
              ? 'The content was flagged by our moderation system. Please review and modify your text.'
              : error || 'Something went wrong with the AI service. Please try again.'}
          </p>
          {onRetry && !isContentModerated && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
