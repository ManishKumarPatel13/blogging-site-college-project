import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Edit3, Trash2, Eye, Calendar } from 'lucide-react';
import { useMyBlogs, useDeleteBlog } from '../hooks/useBlogs';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const MyBlogsPage = () => {
  const { data, isLoading, error } = useMyBlogs();
  const deleteBlog = useDeleteBlog();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const blogs = data?.blogs || [];

  const handleDelete = async (id) => {
    try {
      await deleteBlog.mutateAsync(id);
      toast.success('Blog deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading your blogs</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Blogs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and edit your blog posts
            </p>
          </div>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Blog
          </Link>
        </div>

        {/* Blog List */}
        {blogs?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No blogs yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start sharing your thoughts with the world
            </p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Blog
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {blogs?.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Blog Info */}
                  <div className="flex-1">
                    <Link 
                      to={`/blog/${blog.id}`}
                      className="text-xl font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {blog.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {blog.excerpt || blog.content?.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </span>
                      {blog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="badge text-xs">
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/blog/${blog.id}`}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/edit/${blog.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(blog.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Delete Blog
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this blog? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteBlog.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteBlog.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogsPage;
