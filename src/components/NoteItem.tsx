import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Check } from 'lucide-react';
import { NoteItem as NoteItemType } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface NoteItemProps {
  item: NoteItemType;
  onUpdate: (updates: Partial<NoteItemType>) => void;
  onDelete: () => void;
  onCreateNext: () => void;
  autoFocus?: boolean;
}

export const NoteItem = ({ item, onUpdate, onDelete, onCreateNext, autoFocus }: NoteItemProps) => {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCreateNext();
    }
    if (e.key === 'Backspace' && item.content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
        "hover:bg-muted/50",
        item.completed && "opacity-60"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" />
      
      {item.type === 'checkbox' && (
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => onUpdate({ completed: checked as boolean })}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      )}

      <input
        ref={inputRef}
        type="text"
        value={item.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        placeholder="Type something..."
        className={cn(
          "flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50",
          item.completed && "line-through"
        )}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
