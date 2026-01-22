'use client';

interface ToolbarProps {
  isDarkMode: boolean;
  onNewNote: () => void;
  onToggleDarkMode: () => void;
}

export default function Toolbar({
  isDarkMode,
  onNewNote,
  onToggleDarkMode,
}: ToolbarProps) {
  return (
    <nav className="toolbar h-14 px-4 flex items-center justify-between shrink-0" role="navigation" aria-label="Main navigation">
      <div className="font-semibold text-lg">
        Cleartype
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewNote}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
          aria-label="Create new note"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
        <button
          onClick={onToggleDarkMode}
          className="toolbar-button text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </nav>
  );
}
