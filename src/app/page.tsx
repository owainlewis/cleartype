'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Toolbar from './components/Toolbar';
import NoteCard from './components/NoteCard';
import { Feed, Note } from './types/content';
import { loadFeed, sortByNewest } from './utils/feed';

const THEME_KEY = 'cleartype-theme';

export default function Home() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>({ items: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const loadedFeed = loadFeed();
    setFeed(loadedFeed);
    setIsLoaded(true);
  }, []);

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

  const handleNewNote = useCallback(() => {
    router.push('/new');
  }, [router]);

  const handleNoteClick = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
  }, [router]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  if (!isLoaded) {
    return null;
  }

  const sortedItems = sortByNewest(feed.items);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        isDarkMode={isDarkMode}
        onNewNote={handleNewNote}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto p-8">
          {sortedItems.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted-foreground)]">
              <p className="mb-4">No notes yet.</p>
              <button
                onClick={handleNewNote}
                className="toolbar-button text-sm font-medium inline-flex items-center gap-1.5 border border-[var(--toolbar-border)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create your first note
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item) => {
                if (item.type === 'note') {
                  const note = item as Note;
                  return (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
