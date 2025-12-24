import { useState, useCallback } from "react";
import { Plus, Type, CheckSquare, Paintbrush, Share2 } from "lucide-react";
import { Note, NoteItem as NoteItemType } from "@/types/note";
import { Button } from "@/components/ui/button";
import { NoteItem } from "./NoteItem";
import { DrawingCanvas } from "./DrawingCanvas";

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (updates: Partial<Note>) => void;
  onAddItem: (type: "text" | "checkbox", afterItemId?: string) => NoteItemType;
  onUpdateItem: (itemId: string, updates: Partial<NoteItemType>) => void;
  onDeleteItem: (itemId: string) => void;
  onShare: () => void;
}

export const NoteEditor = ({
  note,
  onUpdateNote,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onShare,
}: NoteEditorProps) => {
  const [showCanvas, setShowCanvas] = useState(!!note.canvasData);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  const handleAddItem = useCallback(
    (type: "text" | "checkbox", afterItemId?: string) => {
      const item = onAddItem(type, afterItemId);
      setNewItemId(item.id);
    },
    [onAddItem]
  );

  const handleSaveCanvas = useCallback(
    (data: string) => {
      onUpdateNote({ canvasData: data });
    },
    [onUpdateNote]
  );

  return (
    <div className="flex-1 h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        {/* Header with Title and Share */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdateNote({ title: e.target.value })}
            placeholder="Untitled Note"
            className="flex-1 font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="hidden md:flex gap-2 shrink-0"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Add Item Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAddItem("text")}
            className="gap-2 text-xs md:text-sm"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>Text
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAddItem("checkbox")}
            className="gap-2 text-xs md:text-sm"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>Task
          </Button>
          <Button
            variant={showCanvas ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowCanvas(!showCanvas)}
            className="gap-2 text-xs md:text-sm"
          >
            <Paintbrush className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showCanvas ? "Hide" : "Show"}
            </span>
            Canvas
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-1 mb-6">
          {note.items.length === 0 && !showCanvas ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">This note is empty</p>
              <p className="text-sm">Add text, tasks, or start drawing!</p>
            </div>
          ) : (
            note.items.map((item) => (
              <NoteItem
                key={item.id}
                item={item}
                onUpdate={(updates) => onUpdateItem(item.id, updates)}
                onDelete={() => onDeleteItem(item.id)}
                onCreateNext={() => handleAddItem(item.type, item.id)}
                autoFocus={item.id === newItemId}
              />
            ))
          )}
        </div>

        {/* Drawing Canvas */}
        {showCanvas && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Drawing Canvas
            </h3>
            <DrawingCanvas
              canvasData={note.canvasData}
              onSave={handleSaveCanvas}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
