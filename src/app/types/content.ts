export interface Content {
  id: string;
  type: 'note' | 'image' | 'link' | 'video';
  createdAt: number;
  updatedAt: number;
}

export interface Note extends Content {
  type: 'note';
  body: string; // HTML from TipTap, max ~500 chars plain text
}

export type AnyContent = Note; // Extend later with Image, Link, Video

export interface Feed {
  items: AnyContent[];
}
