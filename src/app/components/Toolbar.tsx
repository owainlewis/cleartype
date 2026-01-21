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
    <div className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
      <div className="font-semibold text-lg">
        Cleartype
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewNote}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5"
          title="Create new note"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
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
