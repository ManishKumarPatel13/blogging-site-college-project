import React from 'react';
import { useParams } from 'react-router-dom';
import { useBlog } from '../hooks/useBlogs';
import BlogViewer from '../components/blog/BlogViewer';

const BlogPage = () => {
  const { id } = useParams();
  const { data: blog, isLoading } = useBlog(id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogViewer blog={blog} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default BlogPage;
