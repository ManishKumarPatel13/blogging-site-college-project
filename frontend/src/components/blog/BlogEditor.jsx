import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Heading3, Minus, Sparkles
} from 'lucide-react';
import AIWritingAssistant from '../ai/AIWritingAssistant';

const MenuBar = ({ editor }) => {
  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: 'Strikethrough' },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), title: 'Code' },
    { type: 'divider' },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
    { type: 'divider' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered List' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), title: 'Horizontal Rule' },
    { type: 'divider' },
    { icon: LinkIcon, action: addLink, active: editor.isActive('link'), title: 'Add Link' },
    { icon: ImageIcon, action: addImage, title: 'Add Image' },
    { type: 'divider' },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo(), title: 'Undo' },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo(), title: 'Redo' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
      {buttons.map((button, index) => {
        if (button.type === 'divider') {
          return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
        }
        return (
          <button
            key={index}
            type="button"
            onClick={button.action}
            disabled={button.disabled}
            title={button.title}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              button.active 
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' 
                : 'text-gray-600 dark:text-gray-400'
            } ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <button.icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

const BlogEditor = ({ content, onChange, placeholder = 'Start writing your blog post...' }) => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiPosition, setAiPosition] = useState({ x: 0, y: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 hover:text-purple-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text.length > 10) {
          setSelectedText(text);
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when prop changes (for edit mode)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Handle AI text application (replace selection or insert at cursor)
  const handleAIApply = useCallback((text) => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Replace selected text
        editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
      } else {
        // Insert at cursor
        editor.chain().focus().insertContent(text).run();
      }
      setShowAIAssistant(false);
    }
  }, [editor]);

  // Open AI assistant
  const handleOpenAI = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    
    if (text.length > 10) {
      setSelectedText(text);
      // Position the AI assistant near the selection
      const coords = editor.view.coordsAtPos(from);
      setAiPosition({ x: coords.left, y: coords.top + 30 });
      setShowAIAssistant(true);
    }
  }, [editor]);

  return (
    <div className="relative">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <MenuBar editor={editor} />
        
        {/* AI Assistant Trigger Button */}
        {selectedText.length > 10 && !showAIAssistant && (
          <div className="absolute right-4 top-16 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenAI();
              }}
              className="btn-ai text-sm flex items-center gap-1 shadow-lg"
              title="AI Writing Assistant"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist
            </button>
          </div>
        )}
        
        <EditorContent editor={editor} />
      </div>
      
      {/* AI Writing Assistant */}
      {showAIAssistant && selectedText && (
        <AIWritingAssistant
          selectedText={selectedText}
          position={aiPosition}
          onApply={handleAIApply}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
};

export default BlogEditor;
