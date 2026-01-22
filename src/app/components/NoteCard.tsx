'use client';

import { Note } from '../types/content';
import { formatDate } from '../utils/feed';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function truncateText(text: string, maxLength: number = 150): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '...';
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const plainText = note.body ? stripHtml(note.body) : '';
  const preview = truncateText(plainText);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="note-card cursor-pointer p-6 rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
    >
      <div className="text-sm text-[var(--muted-foreground)] mb-3">
        {formatDate(note.createdAt)}
      </div>
      <p className="text-[var(--foreground)] leading-relaxed">
        {preview || <span className="text-[var(--muted-foreground)]">Empty note</span>}
      </p>
    </div>
  );
}
