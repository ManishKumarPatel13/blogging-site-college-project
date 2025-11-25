import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  PenSquare,
  Shield,
  ArrowRight,
  Tag,
  FileText,
  Wand2,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useRecentBlogs } from '../hooks/useBlogs';
import BlogCard from '../components/blog/BlogCard';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: recentBlogs } = useRecentBlogs(3);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Writing Assistant',
      description: 'Get intelligent suggestions to expand, improve, and refine your content.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Tag,
      title: 'Smart Auto-Tagging',
      description: 'AI analyzes your content and suggests relevant tags automatically.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Title Generation',
      description: 'Generate catchy, SEO-friendly titles with a single click.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: Wand2,
      title: 'Tone Adjustment',
      description: 'Change your writing tone from casual to professional instantly.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Bot,
      title: 'Content Continuation',
      description: 'AI continues writing where you left off, matching your style.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Grammar Check',
      description: 'Automatic grammar and spelling corrections for polished content.',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Writers' },
    { value: '50K+', label: 'Blogs Published' },
    { value: '99%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'AI Assistance' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-ai-purple/10 dark:from-gray-900 dark:via-gray-900 dark:to-ai-purple/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-ai-purple/5 to-transparent" />
        
        {/* Animated Blobs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-ai-purple/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-ai-blue/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ai-purple/10 text-ai-purple dark:text-ai-cyan border border-ai-purple/20 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Write Better Content with{' '}
              <span className="gradient-text">AI-Powered</span> Assistance
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Transform your blogging experience with intelligent writing tools. 
              Create, enhance, and publish amazing content effortlessly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <Link to="/create" className="btn-ai flex items-center gap-2 text-lg px-8 py-3">
                  <PenSquare className="w-5 h-5" />
                  Start Writing
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-ai flex items-center gap-2 text-lg px-8 py-3">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/blogs" className="btn-secondary flex items-center gap-2 text-lg px-8 py-3">
                    Explore Blogs
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Supercharge Your Writing with AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Our AI-powered features help you write better, faster, and more effectively.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              How It Works
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Write Your Content', desc: 'Start typing your blog post in our intuitive editor' },
              { step: 2, title: 'Let AI Assist', desc: 'Select text and use AI tools to enhance your writing' },
              { step: 3, title: 'Publish & Share', desc: 'Review, add tags, and publish your polished content' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-ai-purple to-ai-blue flex items-center justify-center text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      {recentBlogs && recentBlogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Recent Blog Posts
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover what our community is writing about
                </p>
              </div>
              <Link
                to="/blogs"
                className="btn-secondary flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBlogs.map((blog, index) => (
                <BlogCard key={blog.id || blog._id} blog={blog} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-ai-purple to-ai-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Ready to Transform Your Writing?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 mb-8"
          >
            Join thousands of writers who are already using AI to create amazing content.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {isAuthenticated ? (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-white text-ai-purple font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PenSquare className="w-5 h-5" />
                Start Writing Now
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-ai-purple font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
