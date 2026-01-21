'use client';

import { Note } from '../types/content';
import { formatDate } from '../utils/feed';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className="note-card cursor-pointer p-6 rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors"
    >
      <div className="text-sm text-[var(--muted-foreground)] mb-3">
        {formatDate(note.createdAt)}
      </div>
      <div
        className="editor-content prose-sm"
        dangerouslySetInnerHTML={{ __html: note.body || '<p class="text-[var(--muted-foreground)]">Empty note</p>' }}
      />
    </div>
  );
}
