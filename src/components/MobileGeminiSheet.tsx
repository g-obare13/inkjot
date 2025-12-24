import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GeminiChat } from './GeminiChat';

interface MobileGeminiSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileGeminiSheet = ({ open, onOpenChange }: MobileGeminiSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Gemini AI Chat</SheetTitle>
        </SheetHeader>
        <GeminiChat />
      </SheetContent>
    </Sheet>
  );
};
