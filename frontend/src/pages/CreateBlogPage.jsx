import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, Sparkles, Tag } from 'lucide-react';
import { useCreateBlog } from '../hooks/useBlogs';
import BlogEditor from '../components/blog/BlogEditor';
import AutoTagSuggestions from '../components/ai/AutoTagSuggestions';
import TitleGenerator from '../components/ai/TitleGenerator';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Health',
  'Business',
  'Entertainment',
  'Education',
  'Science',
  'Sports',
  'Other'
];

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const createBlog = useCreateBlog();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [showAITools, setShowAITools] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    
    if (!content.trim() || content === '<p></p>') {
      toast.error('Please add some content');
      return;
    }

    try {
      const blogData = {
        title: title.trim(),
        content,
        summary: summary.trim() || undefined,
        category: category || 'Other',
        tags,
        media: coverImage.trim() ? [coverImage.trim()] : undefined,
      };
      
      await createBlog.mutateAsync(blogData);
      toast.success('Blog published successfully!');
      navigate('/my-blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create blog');
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Blog
            </h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAITools(!showAITools)}
                className={`btn-ai inline-flex items-center gap-2 ${showAITools ? 'ring-2 ring-purple-500' : ''}`}
              >
                <Sparkles className="w-4 h-4" />
                AI Tools
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              {showAITools && content.length > 50 ? (
                <TitleGenerator
                  content={content.replace(/<[^>]*>/g, '')}
                  value={title}
                  onChange={setTitle}
                  minContentLength={50}
                />
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                  className="input text-xl font-semibold"
                  maxLength={200}
                />
              )}
              <p className="mt-1 text-sm text-gray-500">{title.length}/200 characters</p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input"
              />
              {coverImage && (
                <div className="mt-2">
                  <img 
                    src={coverImage} 
                    alt="Cover preview" 
                    className="max-h-48 rounded-lg object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <AutoTagSuggestions
                content={content.replace(/<[^>]*>/g, '')}
                selectedTags={tags}
                onTagsChange={setTags}
                minContentLength={100}
              />
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                  placeholder="Add a tag and press Enter"
                  className="input flex-1"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary (optional)
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description of your blog (auto-generated if left empty)"
                className="input h-24 resize-none"
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">{summary.length}/500 characters</p>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <BlogEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your amazing blog post..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBlog.isPending}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createBlog.isPending ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
