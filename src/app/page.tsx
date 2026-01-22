'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const THEME_KEY = 'cleartype-theme';

export default function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setIsLoaded(true);
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

  const handleStartWriting = useCallback(() => {
    router.push('/notes/new');
  }, [router]);

  const handleViewNotes = useCallback(() => {
    router.push('/notes');
  }, [router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <nav className="h-14 px-4 flex items-center justify-between shrink-0">
        <div className="font-semibold text-lg">Cleartype</div>
        <button
          onClick={handleToggleDarkMode}
          className="toolbar-button text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-[700px] mx-auto px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Write. Nothing else.
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-2">
            A distraction-free space for your thoughts.
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mb-12">
            No account needed. Works offline. Just write.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStartWriting}
              className="toolbar-button text-base font-medium px-6 py-3 border border-[var(--toolbar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Start writing
            </button>
            <button
              onClick={handleViewNotes}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Your notes &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
