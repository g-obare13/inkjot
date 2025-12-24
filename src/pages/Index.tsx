import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useShareNote } from "@/hooks/useShareNote";
import { NotesSidebar } from "@/components/NotesSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileNotesSidebar } from "@/components/MobileNotesSidebar";
import { MobileGeminiSheet } from "@/components/MobileGeminiSheet";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const {
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
  } = useNotes();

  const { shareNote, decodeNote } = useShareNote();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [geminiSheetOpen, setGeminiSheetOpen] = useState(false);

  // Handle shared note from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("share");

    if (sharedData) {
      const noteData = decodeNote(sharedData);
      if (noteData) {
        const newNote = createNote();
        updateNote(newNote.id, {
          title: noteData.title,
          items: noteData.items || [],
          canvasData: noteData.canvasData,
        });
        toast.success("Shared note imported!");
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        toast.error("Failed to import shared note");
      }
    }
  }, []);

  const handleShare = () => {
    if (activeNote) {
      shareNote(activeNote);
    }
  };

  return (
    <div className="flex h-screen bg-background paper-texture">
      {/* Desktop Sidebar */}
      <NotesSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onOpenGemini={() => setGeminiSheetOpen(true)}
      />

      {/* Mobile Sidebar Sheet */}
      <MobileNotesSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onDeleteNote={deleteNote}
      />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onUpdateNote={(updates) => updateNote(activeNote.id, updates)}
            onAddItem={(type, afterItemId) =>
              addItem(activeNote.id, type, afterItemId)
            }
            onUpdateItem={(itemId, updates) =>
              updateItem(activeNote.id, itemId, updates)
            }
            onDeleteItem={(itemId) => deleteItem(activeNote.id, itemId)}
            onShare={handleShare}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-20 md:pb-0 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
              Welcome to Canvas Notes
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md text-sm md:text-base">
              Create notes, add tasks, and sketch your ideas all in one place.
              Your notes are automatically saved to your browser.
            </p>
            <Button
              onClick={createNote}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FileText className="h-5 w-5" />
              Create Your First Note
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onCreateNote={createNote}
        onOpenGemini={() => setGeminiSheetOpen(true)}
      />

      {/* Mobile Gemini Chat Sheet */}
      <MobileGeminiSheet
        open={geminiSheetOpen}
        onOpenChange={setGeminiSheetOpen}
      />
    </div>
  );
};

export default Index;
