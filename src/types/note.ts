export interface NoteItem {
  id: string;
  type: 'text' | 'checkbox';
  content: string;
  completed?: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  items: NoteItem[];
  canvasData: string | null;
  createdAt: number;
  updatedAt: number;
}
