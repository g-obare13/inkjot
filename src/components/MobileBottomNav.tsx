import { Plus, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
  onCreateNote: () => void;
  onOpenGemini: () => void;
}

export const MobileBottomNav = ({
  onOpenSidebar,
  onCreateNote,
  onOpenGemini,
}: MobileBottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 md:hidden z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="h-12 w-12 flex flex-col gap-1"
        >
          <Menu className="h-5 w-5 text-foreground" />
          <span className="text-[10px] text-muted-foreground">Notes</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNote}
          className="h-12 w-12 flex flex-col gap-1"
        >
          <Plus className="h-5 w-5 text-foreground" />
          <span className="text-[10px] text-muted-foreground">New</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenGemini}
          className="h-12 w-12 flex flex-col gap-1"
        >
          <Sparkles className="h-5 w-5 text-foreground" />
          <span className="text-[10px] text-muted-foreground">Gemini</span>
        </Button>

        <div className="h-12 w-12 flex flex-col items-center justify-center gap-1">
          <ThemeToggle />
          <span className="text-[10px] text-muted-foreground">Theme</span>
        </div>
      </div>
    </nav>
  );
};
