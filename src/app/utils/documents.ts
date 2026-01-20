export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentStore {
  docs: Document[];
  activeDocId: string | null;
}

const STORAGE_KEY = 'cleartype-documents';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createDocument(title?: string): Document {
  const now = Date.now();
  return {
    id: generateId(),
    title: title || 'Untitled',
    content: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function loadDocuments(): DocumentStore {
  if (typeof window === 'undefined') {
    return { docs: [], activeDocId: null };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, start fresh
    }
  }

  // Migrate from old single-document storage
  const oldContent = localStorage.getItem('scratch-pad-content');
  if (oldContent) {
    const doc = createDocument('Untitled');
    doc.content = oldContent;
    const store: DocumentStore = { docs: [doc], activeDocId: doc.id };
    saveDocuments(store);
    localStorage.removeItem('scratch-pad-content');
    return store;
  }

  // Start with one empty document
  const doc = createDocument();
  return { docs: [doc], activeDocId: doc.id };
}

export function saveDocuments(store: DocumentStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getDocumentTitle(doc: Document): string {
  if (doc.title && doc.title !== 'Untitled') {
    return doc.title;
  }
  // Auto-generate from first line of content
  const firstLine = doc.content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 0) {
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
  }
  return 'Untitled';
}
