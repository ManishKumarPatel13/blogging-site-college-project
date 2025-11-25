import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle } from 'lucide-react';
import BlogCard from './BlogCard';
import { PageLoader } from '../common/LoadingSpinner';

const BlogList = ({ blogs, isLoading, error, emptyMessage = 'No blogs found' }) => {
  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load blogs
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error.message || 'Something went wrong. Please try again later.'}
        </p>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
        data-testid="empty-blog-list"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Be the first to share your thoughts and ideas!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-list">
      {blogs.map((blog, index) => (
        <BlogCard key={blog._id || blog.id} blog={blog} index={index} />
      ))}
    </div>
  );
};

export default BlogList;
