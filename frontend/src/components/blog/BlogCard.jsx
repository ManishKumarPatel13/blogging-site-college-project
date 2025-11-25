import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const BlogCard = ({ blog, index = 0 }) => {
  const {
    _id,
    id,
    title,
    content,
    summary,
    tags = [],
    author,
    createdAt,
    aiGenerated,
    category,
  } = blog;

  const blogId = _id || id;

  // Extract first 150 chars of content as preview if no summary
  const preview = summary || (content ? content.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : '');

  // Format date
  const formattedDate = createdAt
    ? format(new Date(createdAt), 'MMM d, yyyy')
    : 'Unknown date';

  // Calculate read time (approx 200 words per minute)
  const wordCount = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card card-hover overflow-hidden group"
      data-testid={`blog-card-${blogId}`}
    >
      <Link to={`/blog/${blogId}`} className="block p-6">
        {/* Category & AI Badge */}
        <div className="flex items-center gap-2 mb-3">
          {category && (
            <span className="badge badge-primary">{category}</span>
          )}
          {aiGenerated && (
            <span className="badge badge-ai flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {title || 'Untitled Post'}
        </h3>

        {/* Preview */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {preview}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-gray-500 dark:text-gray-400">
                #{tag}
                {i < Math.min(tags.length - 1, 2) && ', '}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-ai-purple flex items-center justify-center text-white text-xs font-medium">
                {author?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {author?.name || author?.nickname || 'Anonymous'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {/* Date */}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            {/* Read Time */}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime} min read
            </span>
          </div>
        </div>

        {/* Read More Arrow */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
