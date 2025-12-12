import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Edit3, Save, X, FileText, Eye } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMyBlogs } from '../hooks/useBlogs';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { data: blogsData } = useMyBlogs();
  const blogs = blogsData?.blogs || [];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const stats = [
    { label: 'Total Blogs', value: blogs?.length || 0, icon: FileText },
    { label: 'Total Views', value: blogs?.reduce((acc, blog) => acc + (blog.views || 0), 0) || 0, icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input text-2xl font-bold mb-2"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {user?.name}
                    </h1>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 mt-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {user?.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input w-full h-24 resize-none"
                    placeholder="Write a short bio about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.bio || 'No bio yet. Click edit to add one!'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="card p-6 text-center">
              <stat.icon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Blogs
            </h2>
            <Link to="/my-blogs" className="text-purple-600 hover:text-purple-700 text-sm">
              View All
            </Link>
          </div>
          
          {blogs?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't written any blogs yet
              </p>
              <Link to="/create" className="btn-primary">
                Write Your First Blog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs?.slice(0, 5).map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.id}`}
                  className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
