'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Feed, Note } from '../../types/content';
import { loadFeed, saveFeed, countChars, formatDate } from '../../utils/feed';

const THEME_KEY = 'cleartype-theme';
const DEBOUNCE_MS = 500;

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<Feed | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      if (!feedRef.current || !noteId) return;

      const content = editor.getHTML();

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const feed = loadFeed();
        const updatedItems = feed.items.map((item) =>
          item.id === noteId && item.type === 'note'
            ? { ...item, body: content, updatedAt: Date.now() }
            : item
        );
        const newFeed = { items: updatedItems };
        saveFeed(newFeed);
        feedRef.current = newFeed;
      }, DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const feed = loadFeed();
    feedRef.current = feed;

    const foundNote = feed.items.find(
      (item) => item.id === noteId && item.type === 'note'
    ) as Note | undefined;

    if (foundNote) {
      setNote(foundNote);
    } else {
      setNotFound(true);
    }

    setIsLoaded(true);
  }, [noteId]);

  useEffect(() => {
    if (editor && note && isLoaded) {
      editor.commands.setContent(note.body || '');
      editor.commands.focus('end');
    }
  }, [editor, note, isLoaded]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      if (editor && feedRef.current) {
        const content = editor.getHTML();
        const feed = loadFeed();
        const updatedItems = feed.items.map((item) =>
          item.id === noteId && item.type === 'note'
            ? { ...item, body: content, updatedAt: Date.now() }
            : item
        );
        saveFeed({ items: updatedItems });
      }
    }
    router.push('/');
  }, [editor, noteId, router]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    const feed = loadFeed();
    const updatedItems = feed.items.filter((item) => item.id !== noteId);
    saveFeed({ items: updatedItems });
    router.push('/');
  }, [noteId, router]);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return newValue;
    });
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (notFound) {
    return (
      <div className="h-screen flex flex-col">
        <div className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
          <button
            onClick={handleBack}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5"
            title="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Note not found</h1>
            <p className="text-[var(--muted-foreground)] mb-4">
              This note may have been deleted or the link is invalid.
            </p>
            <button
              onClick={handleBack}
              className="toolbar-button text-sm font-medium inline-flex items-center gap-1.5 border border-[var(--toolbar-border)]"
            >
              Return to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const charCount = editor ? countChars(editor.getHTML()) : 0;

  return (
    <div className="h-screen flex flex-col">
      <div className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={handleBack}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5"
          title="Back to home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 text-red-500 hover:text-red-600"
            title="Delete note"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto p-8">
          <div className="flex items-center justify-between mb-4 text-xs text-[var(--muted-foreground)]">
            <span>{note ? formatDate(note.createdAt) : ''}</span>
            <span>{charCount} chars</span>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete note?</h2>
            <p className="text-[var(--muted-foreground)] text-sm mb-4">
              This action cannot be undone. The note will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                className="toolbar-button text-sm font-medium px-4 py-2 border border-[var(--toolbar-border)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="toolbar-button text-sm font-medium px-4 py-2 bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
