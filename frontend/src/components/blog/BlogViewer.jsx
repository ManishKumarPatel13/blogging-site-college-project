import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Tag,
  ArrowLeft,
  Clock,
  Edit,
  Trash2,
  Share2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useDeleteBlog } from '../../hooks/useBlogs';
import { PageLoader } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const BlogViewer = ({ blog, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const deleteBlog = useDeleteBlog();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Blog not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/blogs" className="btn-primary">
          Browse Blogs
        </Link>
      </div>
    );
  }

  const {
    _id,
    id,
    title,
    content,
    summary,
    tags = [],
    author,
    createdAt,
    updatedAt,
    aiGenerated,
    category,
  } = blog;

  const blogId = _id || id;
  const authorId = author?.id || author?._id;
  const userId = user?.id || user?._id;
  const isAuthor = user && userId && authorId && String(userId) === String(authorId);

  // Format dates
  const formattedDate = createdAt
    ? format(new Date(createdAt), 'MMMM d, yyyy')
    : 'Unknown date';
  const formattedUpdate = updatedAt && updatedAt !== createdAt
    ? format(new Date(updatedAt), 'MMMM d, yyyy')
    : null;

  // Calculate read time
  const wordCount = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleDelete = async () => {
    try {
      await deleteBlog.mutateAsync(blogId);
      navigate('/blogs');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: title || 'Blog Post',
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
      data-testid="blog-viewer"
    >
      {/* Back Button */}
      <Link
        to="/blogs"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blogs
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Category & Badges */}
        <div className="flex items-center gap-2 mb-4">
          {category && <span className="badge badge-primary">{category}</span>}
          {aiGenerated && (
            <span className="badge badge-ai flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title || 'Untitled Post'}
        </h1>

        {/* Summary */}
        {summary && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-ai-purple flex items-center justify-center text-white font-medium">
              {author?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {author?.name || author?.nickname || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {author?.email}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Date & Read Time */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {wordCount} words
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          {isAuthor && (
            <>
              <Link
                to={`/edit/${blogId}`}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-6 border-t border-gray-200 dark:border-gray-700">
          <Tag className="w-4 h-4 text-gray-400" />
          {tags.map((tag, i) => (
            <span key={i} className="badge badge-primary">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Updated Info */}
      {formattedUpdate && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Last updated on {formattedUpdate}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Blog Post?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. Your blog post will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBlog.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                {deleteBlog.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.article>
  );
};

export default BlogViewer;
