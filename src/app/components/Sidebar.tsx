'use client';

import { useState } from 'react';
import { Document, getDocumentTitle } from '../utils/documents';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  isOpen: boolean;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onDeleteDoc: (id: string) => void;
  onToggle: () => void;
}

export default function Sidebar({
  documents,
  activeDocId,
  isOpen,
  onSelectDoc,
  onCreateDoc,
  onRenameDoc,
  onDeleteDoc,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (doc: Document) => {
    setEditingId(doc.id);
    setEditTitle(doc.title || getDocumentTitle(doc));
  };

  const handleFinishRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameDoc(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleDelete = (doc: Document) => {
    const title = getDocumentTitle(doc);
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      onDeleteDoc(doc.id);
    }
  };

  const sortedDocs = [...documents].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-header">
        <span className="font-medium text-sm">Documents</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateDoc}
            className="p-1.5 rounded hover:bg-[var(--button-hover)]"
            title="New document"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-[var(--button-hover)]"
            title="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedDocs.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item group ${doc.id === activeDocId ? 'doc-item-active' : ''}`}
          >
            {editingId === doc.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-sm px-1 py-0.5 border border-[var(--toolbar-border)] rounded"
                autoFocus
              />
            ) : (
              <button
                onClick={() => onSelectDoc(doc.id)}
                className="flex-1 text-left text-sm truncate"
              >
                {getDocumentTitle(doc)}
              </button>
            )}

            <div className="doc-actions opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
              <button
                onClick={() => handleStartRename(doc)}
                className="p-1 rounded hover:bg-[var(--button-hover)]"
                title="Rename"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
              {documents.length > 1 && (
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1 rounded hover:bg-[var(--button-hover)] text-red-500"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
