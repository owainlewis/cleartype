import { Feed, Note, AnyContent } from '../types/content';

const STORAGE_KEY = 'cleartype-feed';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createNote(body: string = ''): Note {
  const now = Date.now();
  return {
    id: generateId(),
    type: 'note',
    body,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadFeed(): Feed {
  if (typeof window === 'undefined') {
    return { items: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, start fresh
    }
  }

  // Migrate from old document storage if it exists
  const oldStorage = localStorage.getItem('cleartype-documents');
  if (oldStorage) {
    try {
      const oldData = JSON.parse(oldStorage);
      if (oldData.docs && Array.isArray(oldData.docs)) {
        const items: Note[] = oldData.docs.map((doc: { id: string; content: string; createdAt: number; updatedAt: number }) => ({
          id: doc.id,
          type: 'note' as const,
          body: doc.content || '',
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));
        const feed: Feed = { items };
        saveFeed(feed);
        return feed;
      }
    } catch {
      // Migration failed, start fresh
    }
  }

  return { items: [] };
}

export function saveFeed(feed: Feed): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function countChars(html: string): number {
  return stripHtml(html).length;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function sortByNewest(items: AnyContent[]): AnyContent[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}
