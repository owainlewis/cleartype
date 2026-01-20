'use client';

interface ToolbarProps {
  content: string;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCopy: () => void;
  onToggleDarkMode: () => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function Toolbar({
  content,
  isDarkMode,
  sidebarOpen,
  onToggleSidebar,
  onCopy,
  onToggleDarkMode,
}: ToolbarProps) {
  const wordCount = countWords(content);
  const charCount = content.length;

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
