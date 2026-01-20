'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import {
  Document,
  DocumentStore,
  loadDocuments,
  saveDocuments,
  createDocument,
} from './utils/documents';

const THEME_KEY = 'cleartype-theme';
const SIDEBAR_KEY = 'cleartype-sidebar';
const DEBOUNCE_MS = 300;

export default function Home() {
  const [store, setStore] = useState<DocumentStore>({ docs: [], activeDocId: null });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedSidebar = localStorage.getItem(SIDEBAR_KEY);
    if (savedSidebar === 'closed') {
      setSidebarOpen(false);
    }

    const loadedStore = loadDocuments();
    setStore(loadedStore);
    setIsLoaded(true);
  }, []);

  // Debounced save
  const debouncedSave = useCallback((newStore: DocumentStore) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDocuments(newStore);
    }, DEBOUNCE_MS);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update dark mode
  useEffect(() => {
    if (!isLoaded) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode, isLoaded]);

  // Get active document
  const activeDoc = store.docs.find((d) => d.id === store.activeDocId) || store.docs[0];

  const handleContentChange = useCallback((newContent: string) => {
    setStore((prev) => {
      const newDocs = prev.docs.map((doc) =>
        doc.id === prev.activeDocId
          ? { ...doc, content: newContent, updatedAt: Date.now() }
          : doc
      );
      const newStore = { ...prev, docs: newDocs };
      debouncedSave(newStore);
      return newStore;
    });
  }, [debouncedSave]);

  const handleSelectDoc = useCallback((id: string) => {
    setStore((prev) => {
      const newStore = { ...prev, activeDocId: id };
      saveDocuments(newStore);
      return newStore;
    });
  }, []);

  const handleCreateDoc = useCallback(() => {
    const newDoc = createDocument();
    setStore((prev) => {
      const newStore = {
        docs: [newDoc, ...prev.docs],
        activeDocId: newDoc.id,
      };
      saveDocuments(newStore);
      return newStore;
    });
  }, []);

  const handleRenameDoc = useCallback((id: string, newTitle: string) => {
    setStore((prev) => {
      const newDocs = prev.docs.map((doc) =>
        doc.id === id ? { ...doc, title: newTitle, updatedAt: Date.now() } : doc
      );
      const newStore = { ...prev, docs: newDocs };
      saveDocuments(newStore);
      return newStore;
    });
  }, []);

  const handleDeleteDoc = useCallback((id: string) => {
    setStore((prev) => {
      const newDocs = prev.docs.filter((doc) => doc.id !== id);
      let newActiveId = prev.activeDocId;

      // If we deleted the active doc, select another one
      if (prev.activeDocId === id) {
        newActiveId = newDocs[0]?.id || null;
      }

      // If no docs left, create a new one
      if (newDocs.length === 0) {
        const newDoc = createDocument();
        const newStore = { docs: [newDoc], activeDocId: newDoc.id };
        saveDocuments(newStore);
        return newStore;
      }

      const newStore = { docs: newDocs, activeDocId: newActiveId };
      saveDocuments(newStore);
      return newStore;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (activeDoc) {
      try {
        // Strip HTML tags for plain text copy
        const plainText = activeDoc.content
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        await navigator.clipboard.writeText(plainText);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [activeDoc]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_KEY, newValue ? 'open' : 'closed');
      return newValue;
    });
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="h-screen flex">
      <Sidebar
        documents={store.docs}
        activeDocId={store.activeDocId}
        isOpen={sidebarOpen}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleCreateDoc}
        onRenameDoc={handleRenameDoc}
        onDeleteDoc={handleDeleteDoc}
        onToggle={handleToggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar
          content={activeDoc?.content || ''}
          isDarkMode={isDarkMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onCopy={handleCopy}
          onToggleDarkMode={handleToggleDarkMode}
        />
        {activeDoc && (
          <Editor
            key={activeDoc.id}
            content={activeDoc.content}
            onContentChange={handleContentChange}
          />
        )}
      </div>
    </div>
  );
}
