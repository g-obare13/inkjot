import { Plus, FileText, Trash2, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onOpenGemini: () => void;
}

export const NotesSidebar = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onOpenGemini,
}: NotesSidebarProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <aside className="hidden md:flex w-72 h-full bg-sidebar border-r border-sidebar-border flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Notes
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenGemini}
              className="h-12 w-12 flex flex-col gap-1"
            >
              <Sparkles className="h-5 w-5 text-foreground" />
            </Button>
            <ThemeToggle />
            <Button
              onClick={onCreateNote}
              size="icon"
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </p>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No notes yet. Create your first note!
            </p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={cn(
                "group relative p-3 rounded-lg cursor-pointer note-card-hover animate-fade-in",
                "border border-transparent",
                activeNoteId === note.id
                  ? "bg-card border-primary/20 shadow-sm"
                  : "hover:bg-card/60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(note.updatedAt)} · {note.items.length} items
                  </p>
                  {note.items[0]?.content && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {note.items[0].content}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
