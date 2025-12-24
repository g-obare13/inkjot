import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNotesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const MobileNotesSidebar = ({
  open,
  onOpenChange,
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
}: MobileNotesSidebarProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSelectNote = (id: string) => {
    onSelectNote(id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 bg-sidebar">
        <SheetHeader className="p-4 border-b border-sidebar-border">
          <SheetTitle className="font-display text-2xl text-foreground">
            Your Notes
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-120px)]">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
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
                onClick={() => handleSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {note.title || 'Untitled'}
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
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
      </SheetContent>
    </Sheet>
  );
};
