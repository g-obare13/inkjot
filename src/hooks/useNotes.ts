import { useState, useEffect, useCallback } from 'react';
import { Note, NoteItem } from '@/types/note';

const STORAGE_KEY = 'canvas-notepad-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotes(parsed);
        if (parsed.length > 0 && !activeNoteId) {
          setActiveNoteId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse notes from localStorage:', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      items: [],
      canvasData: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    return newNote;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
    }
  }, [activeNoteId, notes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
  }, []);

  const addItem = useCallback((noteId: string, type: 'text' | 'checkbox' = 'text', afterItemId?: string) => {
    const newItem: NoteItem = {
      id: crypto.randomUUID(),
      type,
      content: '',
      completed: type === 'checkbox' ? false : undefined,
      createdAt: Date.now(),
    };
    setNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      
      let newItems: NoteItem[];
      if (afterItemId) {
        const index = note.items.findIndex(item => item.id === afterItemId);
        if (index !== -1) {
          newItems = [
            ...note.items.slice(0, index + 1),
            newItem,
            ...note.items.slice(index + 1)
          ];
        } else {
          newItems = [...note.items, newItem];
        }
      } else {
        newItems = [...note.items, newItem];
      }
      
      return { ...note, items: newItems, updatedAt: Date.now() };
    }));
    return newItem;
  }, []);

  const updateItem = useCallback((noteId: string, itemId: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            items: note.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: Date.now()
          }
        : note
    ));
  }, []);

  const deleteItem = useCallback((noteId: string, itemId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            items: note.items.filter(item => item.id !== itemId),
            updatedAt: Date.now()
          }
        : note
    ));
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  return {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    deleteNote,
    updateNote,
    addItem,
    updateItem,
    deleteItem,
  };
};
