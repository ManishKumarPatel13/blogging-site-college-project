# 🎨 Frontend Development Guide

A comprehensive guide for building a cutting-edge blogging platform frontend that integrates with the AI-powered backend.

---

## 📋 Table of Contents

1. [Tech Stack Recommendations](#-tech-stack-recommendations)
2. [Project Structure](#-project-structure)
3. [Authentication Flow](#-authentication-flow)
4. [API Integration Setup](#-api-integration-setup)
5. [AI Features Integration](#-ai-features-integration)
6. [UI/UX Components](#-uiux-components)
7. [Real-time Features](#-real-time-features)
8. [Performance Optimization](#-performance-optimization)
9. [Deployment](#-deployment)

---

## 🛠 Tech Stack Recommendations

### Recommended Stack (Modern & Performant)

| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js 14+** | Framework | SSR, App Router, Server Actions |
| **TypeScript** | Language | Type safety, better DX |
| **Tailwind CSS** | Styling | Utility-first, fast development |
| **shadcn/ui** | Components | Beautiful, accessible, customizable |
| **Zustand** | State Management | Simple, lightweight |
| **TanStack Query** | Data Fetching | Caching, mutations, infinite scroll |
| **Framer Motion** | Animations | Smooth, performant animations |
| **Tiptap** | Rich Text Editor | Extensible, AI-friendly |

### Alternative Stack

| Technology | Purpose |
|------------|---------|
| **Vite + React** | Faster dev builds |
| **Chakra UI** | Pre-built components |
| **Redux Toolkit** | Complex state |
| **SWR** | Data fetching |

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── blogs/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # View blog
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create blog
│   │   │   ├── edit/[id]/
│   │   │   │   └── page.tsx      # Edit blog
│   │   │   └── page.tsx          # All blogs
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes (if needed)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ai/                       # AI-powered components
│   │   ├── AIWritingAssistant.tsx
│   │   ├── AutoTagSuggestions.tsx
│   │   ├── TitleGenerator.tsx
│   │   ├── ContentSummarizer.tsx
│   │   └── GrammarChecker.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogEditor.tsx
│   │   ├── BlogList.tsx
│   │   └── BlogViewer.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── ui/                       # shadcn/ui components
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useBlogs.ts
│   ├── useAI.ts
│   └── useDebounce.ts
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts
├── stores/
│   ├── authStore.ts
│   └── blogStore.ts
├── types/
│   ├── auth.ts
│   ├── blog.ts
│   └── ai.ts
└── constants/
    └── index.ts
```

---

## 🔐 Authentication Flow

### API Client Setup

```typescript
// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Auth Store (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  nickname?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### Login Component

```tsx
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/blogs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={loginWithGoogle}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
```

---

## 🤖 AI Features Integration

### AI Hook

```typescript
// hooks/useAI.ts
import { useState } from 'react';
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface AIError {
  code: string;
  message: string;
  hint?: string;
}

export function useAI() {
  const [error, setError] = useState<AIError | null>(null);

  const handleError = (err: any) => {
    const response = err.response?.data;
    if (response?.code === 'CONTENT_MODERATED') {
      setError({
        code: 'CONTENT_MODERATED',
        message: response.message,
        hint: response.hint,
      });
    } else {
      setError({
        code: 'ERROR',
        message: response?.message || 'AI service unavailable',
      });
    }
  };

  // Generate tags
  const generateTags = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post('/ai/tags', { content, maxTags: 5 });
      return data.tags;
    },
    onError: handleError,
  });

  // Generate summary
  const generateSummary = useMutation({
    mutationFn: async ({ content, length = 'short' }: { content: string; length?: string }) => {
      const { data } = await api.post('/ai/summary', { content, length });
      return data.summary;
    },
    onError: handleError,
  });

  // Generate titles
  const generateTitles = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post('/ai/titles', { content, count: 5 });
      return data.titles;
    },
    onError: handleError,
  });

  // Expand text
  const expandText = useMutation({
    mutationFn: async ({ text, tone = 'professional' }: { text: string; tone?: string }) => {
      const { data } = await api.post('/ai/expand', { text, tone });
      return data.expanded;
    },
    onError: handleError,
  });

  // Improve text
  const improveText = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post('/ai/improve', { text });
      return data;
    },
    onError: handleError,
  });

  // Change tone
  const changeTone = useMutation({
    mutationFn: async ({ text, targetTone }: { text: string; targetTone: string }) => {
      const { data } = await api.post('/ai/tone', { text, targetTone });
      return data.rewritten;
    },
    onError: handleError,
  });

  // Continue writing
  const continueWriting = useMutation({
    mutationFn: async ({ text, sentences = 3 }: { text: string; sentences?: number }) => {
      const { data } = await api.post('/ai/continue', { text, sentences });
      return data.continuation;
    },
    onError: handleError,
  });

  // Grammar check
  const checkGrammar = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post('/ai/grammar', { text });
      return data;
    },
    onError: handleError,
  });

  // Full analysis
  const analyzeContent = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post('/ai/analyze', { content });
      return data.analysis;
    },
    onError: handleError,
  });

  return {
    error,
    clearError: () => setError(null),
    generateTags,
    generateSummary,
    generateTitles,
    expandText,
    improveText,
    changeTone,
    continueWriting,
    checkGrammar,
    analyzeContent,
  };
}
```

### AI Writing Assistant Component

```tsx
// components/ai/AIWritingAssistant.tsx
'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Expand, 
  Wand2, 
  MessageSquare, 
  PenLine,
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIWritingAssistantProps {
  selectedText: string;
  onApply: (newText: string) => void;
  onClose: () => void;
}

export function AIWritingAssistant({ selectedText, onApply, onClose }: AIWritingAssistantProps) {
  const { expandText, improveText, changeTone, continueWriting, error, clearError } = useAI();
  const [result, setResult] = useState<string | null>(null);

  const actions = [
    {
      id: 'expand',
      label: 'Expand',
      icon: Expand,
      description: 'Make it longer and more detailed',
      action: async () => {
        const expanded = await expandText.mutateAsync({ text: selectedText });
        setResult(expanded);
      },
      isLoading: expandText.isPending,
    },
    {
      id: 'improve',
      label: 'Improve',
      icon: Wand2,
      description: 'Enhance clarity and style',
      action: async () => {
        const { improved } = await improveText.mutateAsync(selectedText);
        setResult(improved);
      },
      isLoading: improveText.isPending,
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: MessageSquare,
      description: 'Make it more formal',
      action: async () => {
        const rewritten = await changeTone.mutateAsync({ 
          text: selectedText, 
          targetTone: 'professional' 
        });
        setResult(rewritten);
      },
      isLoading: changeTone.isPending,
    },
    {
      id: 'casual',
      label: 'Casual',
      icon: MessageSquare,
      description: 'Make it more relaxed',
      action: async () => {
        const rewritten = await changeTone.mutateAsync({ 
          text: selectedText, 
          targetTone: 'casual' 
        });
        setResult(rewritten);
      },
      isLoading: changeTone.isPending,
    },
    {
      id: 'continue',
      label: 'Continue',
      icon: PenLine,
      description: 'Keep writing from here',
      action: async () => {
        const continuation = await continueWriting.mutateAsync({ text: selectedText });
        setResult(selectedText + ' ' + continuation);
      },
      isLoading: continueWriting.isPending,
    },
  ];

  const isAnyLoading = actions.some(a => a.isLoading);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute z-50 bg-white rounded-xl shadow-2xl border p-4 w-80"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <span className="font-semibold">AI Assistant</span>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">{error.message}</p>
                {error.hint && (
                  <p className="text-xs text-amber-600 mt-1">{error.hint}</p>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearError}
              className="mt-2 text-xs"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!result && (
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              disabled={isAnyLoading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              {action.isLoading ? (
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <action.icon className="w-4 h-4" />
              )}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-3">
          <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg text-sm">
            {result}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApply(result)} className="flex-1">
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={() => setResult(null)}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2"
      >
        ✕
      </Button>
    </motion.div>
  );
}
```

### Auto-Tag Suggestions Component

```tsx
// components/ai/AutoTagSuggestions.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, X, RefreshCw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface AutoTagSuggestionsProps {
  content: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function AutoTagSuggestions({ 
  content, 
  selectedTags, 
  onTagsChange 
}: AutoTagSuggestionsProps) {
  const { generateTags } = useAI();
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const debouncedContent = useDebounce(content, 1000);

  // Auto-generate tags when content changes significantly
  useEffect(() => {
    if (debouncedContent.length >= 100 && suggestedTags.length === 0) {
      handleGenerateTags();
    }
  }, [debouncedContent]);

  const handleGenerateTags = async () => {
    if (content.length < 50) return;
    try {
      const tags = await generateTags.mutateAsync(content);
      setSuggestedTags(tags.filter((t: string) => !selectedTags.includes(t)));
    } catch (error) {
      console.error('Failed to generate tags');
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
      setSuggestedTags(suggestedTags.filter(t => t !== tag));
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
          {selectedTags.length === 0 && (
            <span className="text-sm text-gray-400">No tags added yet</span>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI Suggestions</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleGenerateTags}
            disabled={generateTags.isPending || content.length < 50}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${generateTags.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {generateTags.isPending ? (
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Analyzing content...
          </div>
        ) : suggestedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-100 gap-1"
                onClick={() => addTag(tag)}
              >
                <Plus className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-purple-600">
            {content.length < 50 
              ? 'Write at least 50 characters to get tag suggestions' 
              : 'Click refresh to get AI-powered tag suggestions'}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Title Generator Component

```tsx
// components/ai/TitleGenerator.tsx
'use client';

import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TitleGeneratorProps {
  content: string;
  currentTitle: string;
  onTitleSelect: (title: string) => void;
}

export function TitleGenerator({ content, currentTitle, onTitleSelect }: TitleGeneratorProps) {
  const { generateTitles } = useAI();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (content.length < 50) return;
    try {
      const titles = await generateTitles.mutateAsync(content);
      setSuggestions(titles);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to generate titles');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Title</label>
      <div className="flex gap-2">
        <Input
          value={currentTitle}
          onChange={(e) => onTitleSelect(e.target.value)}
          placeholder="Enter a catchy title..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerate}
          disabled={generateTitles.isPending || content.length < 50}
        >
          {generateTitles.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1" />
              AI
            </>
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white border rounded-lg shadow-lg space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">AI Suggestions</span>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>✕</Button>
          </div>
          {suggestions.map((title, index) => (
            <button
              key={index}
              onClick={() => {
                onTitleSelect(title);
                setIsOpen(false);
              }}
              className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Check className={`w-4 h-4 ${currentTitle === title ? 'text-purple-500' : 'text-transparent'}`} />
              {title}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
```

---

## 📝 Blog Editor with AI Integration

```tsx
// components/blog/BlogEditor.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { AIWritingAssistant } from '@/components/ai/AIWritingAssistant';
import { AutoTagSuggestions } from '@/components/ai/AutoTagSuggestions';
import { TitleGenerator } from '@/components/ai/TitleGenerator';
import { useAI } from '@/hooks/useAI';
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Sparkles,
  Save,
  Eye
} from 'lucide-react';

export function BlogEditor() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const { analyzeContent } = useAI();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content: '',
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelectedText(text);
    },
  });

  const content = editor?.getText() || '';

  // Create blog mutation
  const createBlog = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/blogs', {
        title,
        content: editor?.getHTML(),
        tags,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Blog published successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish');
    },
  });

  // Auto-analyze with AI
  const handleAutoAnalyze = async () => {
    if (content.length < 100) {
      toast.error('Write at least 100 characters for AI analysis');
      return;
    }

    try {
      const analysis = await analyzeContent.mutateAsync(content);
      
      // Apply suggestions
      if (analysis.titles?.[0] && !title) {
        setTitle(analysis.titles[0]);
      }
      if (analysis.tags?.length > 0) {
        setTags(analysis.tags);
      }
      
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('AI analysis failed');
    }
  };

  const applyAIText = useCallback((newText: string) => {
    if (editor) {
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
    }
    setShowAIAssistant(false);
  }, [editor]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Blog</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAutoAnalyze}
            disabled={analyzeContent.isPending}
          >
            <Sparkles className={`w-4 h-4 mr-2 ${analyzeContent.isPending ? 'animate-pulse' : ''}`} />
            Auto-Analyze
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={() => createBlog.mutate()}
            disabled={createBlog.isPending || !title || content.length < 50}
          >
            <Save className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Title with AI */}
      <TitleGenerator
        content={content}
        currentTitle={title}
        onTitleSelect={setTitle}
      />

      {/* Editor */}
      <div className="mt-4 relative">
        <div className="border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-4 h-4" />
            </Button>
            
            <div className="flex-1" />
            
            {/* AI Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAIAssistant(true)}
              disabled={!selectedText}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Assist
            </Button>
          </div>

          {/* Editor Content */}
          <EditorContent 
            editor={editor} 
            className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
          />
        </div>

        {/* Floating AI Assistant */}
        {showAIAssistant && selectedText && (
          <AIWritingAssistant
            selectedText={selectedText}
            onApply={applyAIText}
            onClose={() => setShowAIAssistant(false)}
          />
        )}
      </div>

      {/* Tags with AI */}
      <div className="mt-6">
        <AutoTagSuggestions
          content={content}
          selectedTags={tags}
          onTagsChange={setTags}
        />
      </div>

      {/* Word Count */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        {content.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}
```

---

## 🎯 UI/UX Best Practices

### 1. Loading States

```tsx
// components/common/AILoadingState.tsx
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function AILoadingState({ message = 'AI is thinking...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles className="w-5 h-5 text-purple-500" />
      </motion.div>
      <span className="text-purple-700">{message}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
```

### 2. Error Handling UI

```tsx
// components/common/AIErrorDisplay.tsx
interface AIErrorDisplayProps {
  code: string;
  message: string;
  hint?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AIErrorDisplay({ code, message, hint, onRetry, onDismiss }: AIErrorDisplayProps) {
  const isModerated = code === 'CONTENT_MODERATED';
  
  return (
    <div className={`p-4 rounded-lg border ${
      isModerated 
        ? 'bg-amber-50 border-amber-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${isModerated ? 'text-amber-500' : 'text-red-500'}`} />
        <div className="flex-1">
          <p className={`font-medium ${isModerated ? 'text-amber-800' : 'text-red-800'}`}>
            {isModerated ? 'Content Moderation Notice' : 'Something went wrong'}
          </p>
          <p className={`text-sm mt-1 ${isModerated ? 'text-amber-700' : 'text-red-700'}`}>
            {message}
          </p>
          {hint && (
            <p className={`text-xs mt-2 ${isModerated ? 'text-amber-600' : 'text-red-600'}`}>
              💡 {hint}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 3. Keyboard Shortcuts

```tsx
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export function useKeyboardShortcuts(editor: any, onAIAssist: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + A = AI Assist
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault();
        onAIAssist();
      }
      
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, onAIAssist]);
}
```

---

## ⚡ Performance Optimization

### 1. Debounce AI Calls

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### 2. Optimistic Updates

```typescript
// When applying AI suggestions, show immediately then sync
const applyAISuggestion = (suggestion: string) => {
  // Optimistically update UI
  editor.commands.insertContent(suggestion);
  
  // No need to wait for backend confirmation for local changes
  toast.success('Applied!');
};
```

### 3. Caching with TanStack Query

```typescript
// Cache AI suggestions to avoid duplicate API calls
const { data: cachedTags } = useQuery({
  queryKey: ['ai-tags', contentHash],
  queryFn: () => generateTags(content),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

---

## 🚀 Deployment

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://blogging-site-college-project.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
.next (for Next.js) or dist (for Vite)
```

---

## 📱 Responsive Design Tips

```css
/* Mobile-first AI Assistant */
@media (max-width: 640px) {
  .ai-assistant {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 1rem 1rem 0 0;
    max-height: 60vh;
  }
}
```

---

## 🎨 Theme & Styling

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ai: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
        },
      },
      animation: {
        'ai-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ai-shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
};
```

---

## ✅ Feature Checklist

- [ ] User authentication (login, register, Google OAuth)
- [ ] Blog CRUD operations
- [ ] Rich text editor with formatting
- [ ] AI-powered title generation
- [ ] AI auto-tagging
- [ ] AI writing assistant (expand, improve, tone, continue)
- [ ] AI content summarization
- [ ] AI grammar checking
- [ ] Content moderation error handling
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Loading states & animations
- [ ] Error boundaries
- [ ] SEO optimization

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Tiptap Editor](https://tiptap.dev)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://zustand-demo.pmnd.rs)

---

## 🔗 API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/google` | GET | Google OAuth |
| `/api/blogs` | GET | List all blogs |
| `/api/blogs` | POST | Create blog |
| `/api/blogs/:id` | GET | Get single blog |
| `/api/blogs/:id` | PUT | Update blog |
| `/api/blogs/:id` | DELETE | Delete blog |
| `/api/ai/tags` | POST | Generate tags |
| `/api/ai/summary` | POST | Generate summary |
| `/api/ai/titles` | POST | Generate titles |
| `/api/ai/expand` | POST | Expand text |
| `/api/ai/improve` | POST | Improve text |
| `/api/ai/tone` | POST | Change tone |
| `/api/ai/continue` | POST | Continue writing |
| `/api/ai/grammar` | POST | Check grammar |
| `/api/ai/analyze` | POST | Full analysis |

---

Happy coding! 🚀
