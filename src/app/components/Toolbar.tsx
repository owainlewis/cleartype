'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface ToolbarProps {
  content: string;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  editor: Editor | null;
  onToggleSidebar: () => void;
  onCopy: () => void;
  onToggleDarkMode: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
}

function countWords(text: string): number {
  const plainText = stripHtml(text).trim();
  if (!plainText) return 0;
  return plainText.split(/\s+/).length;
}

function countChars(text: string): number {
  return stripHtml(text).length;
}

type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'orderedList' | 'blockquote';

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading1', label: 'Heading 1' },
  { value: 'heading2', label: 'Heading 2' },
  { value: 'heading3', label: 'Heading 3' },
  { value: 'bulletList', label: 'Bulleted List' },
  { value: 'orderedList', label: 'Numbered List' },
  { value: 'blockquote', label: 'Quote' },
];

function getActiveBlockType(editor: Editor | null): BlockType {
  if (!editor) return 'paragraph';
  if (editor.isActive('heading', { level: 1 })) return 'heading1';
  if (editor.isActive('heading', { level: 2 })) return 'heading2';
  if (editor.isActive('heading', { level: 3 })) return 'heading3';
  if (editor.isActive('bulletList')) return 'bulletList';
  if (editor.isActive('orderedList')) return 'orderedList';
  if (editor.isActive('blockquote')) return 'blockquote';
  return 'paragraph';
}

function setBlockType(editor: Editor | null, type: BlockType) {
  if (!editor) return;

  switch (type) {
    case 'paragraph':
      editor.chain().focus().setParagraph().run();
      break;
    case 'heading1':
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case 'heading2':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case 'heading3':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run();
      break;
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run();
      break;
  }
}

export default function Toolbar({
  content,
  isDarkMode,
  sidebarOpen,
  editor,
  onToggleSidebar,
  onCopy,
  onToggleDarkMode,
}: ToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeType, setActiveType] = useState<BlockType>('paragraph');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update active type when editor selection changes
  useEffect(() => {
    if (!editor) return;

    const updateActiveType = () => {
      setActiveType(getActiveBlockType(editor));
    };

    editor.on('selectionUpdate', updateActiveType);
    editor.on('transaction', updateActiveType);
    updateActiveType();

    return () => {
      editor.off('selectionUpdate', updateActiveType);
      editor.off('transaction', updateActiveType);
    };
  }, [editor]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wordCount = countWords(content);
  const charCount = countChars(content);
  const activeLabel = BLOCK_TYPES.find(t => t.value === activeType)?.label || 'Paragraph';

  const handleSelectType = (type: BlockType) => {
    setBlockType(editor, type);
    setDropdownOpen(false);
  };

  return (
    <div className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5"
          title={sidebarOpen ? 'Hide documents' : 'Show documents'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
          Docs
        </button>

        {/* Block Type Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 min-w-[120px] justify-between"
          >
            {activeLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-[var(--toolbar-bg)] border border-[var(--toolbar-border)] rounded-md shadow-lg z-50 min-w-[160px]">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSelectType(type.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--button-hover)] flex items-center gap-2 ${
                    activeType === type.value ? 'bg-[var(--button-hover)]' : ''
                  }`}
                >
                  {activeType === type.value && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                  <span className={activeType === type.value ? '' : 'ml-5'}>{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {wordCount} {wordCount === 1 ? 'word' : 'words'} / {charCount} {charCount === 1 ? 'char' : 'chars'}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="toolbar-button text-sm font-medium"
          title="Copy to clipboard"
        >
          Copy
        </button>
        <button
          onClick={onToggleDarkMode}
          className="toolbar-button text-sm font-medium"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}
