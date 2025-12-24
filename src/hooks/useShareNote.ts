import { useCallback } from 'react';
import { Note } from '@/types/note';
import { toast } from 'sonner';

export const useShareNote = () => {
  const encodeNote = useCallback((note: Note): string => {
    const shareData = {
      t: note.title,
      i: note.items.map(item => ({
        y: item.type,
        c: item.content,
        d: item.completed,
      })),
      d: note.canvasData,
    };
    return btoa(encodeURIComponent(JSON.stringify(shareData)));
  }, []);

  const decodeNote = useCallback((encoded: string): Partial<Note> | null => {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      return {
        title: decoded.t || 'Shared Note',
        items: (decoded.i || []).map((item: { y: string; c: string; d?: boolean }) => ({
          id: crypto.randomUUID(),
          type: item.y as 'text' | 'checkbox',
          content: item.c,
          completed: item.d,
          createdAt: Date.now(),
        })),
        canvasData: decoded.d || null,
      };
    } catch (e) {
      console.error('Failed to decode shared note:', e);
      return null;
    }
  }, []);

  const shareNote = useCallback((note: Note) => {
    const encoded = encodeNote(note);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    
    if (navigator.share) {
      navigator.share({
        title: note.title || 'Shared Note',
        url,
      }).catch(() => {
        // User cancelled or error, fallback to clipboard
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  }, [encodeNote]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return { shareNote, decodeNote };
};
