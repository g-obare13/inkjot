import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { Pencil, Eraser, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  canvasData: string | null;
  onSave: (data: string) => void;
}

const COLORS = [
  '#1a1a1a',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export const DrawingCanvas = ({ canvasData, onSave }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eraserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isErasingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rasterizedRef = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = 300;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      isDrawingMode: true,
    });

    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    // Create eraser overlay canvas
    const eraserCanvas = document.createElement('canvas');
    eraserCanvas.width = width;
    eraserCanvas.height = height;
    eraserCanvas.style.position = 'absolute';
    eraserCanvas.style.top = '0';
    eraserCanvas.style.left = '0';
    eraserCanvas.style.pointerEvents = 'none';
    eraserCanvas.style.display = 'none';
    container.appendChild(eraserCanvas);
    eraserCanvasRef.current = eraserCanvas;

    setFabricCanvas(canvas);

    // Load existing data
    if (canvasData) {
      try {
        canvas.loadFromJSON(JSON.parse(canvasData)).then(() => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Failed to load canvas data:', e);
      }
    }

    return () => {
      canvas.dispose();
      if (eraserCanvas.parentNode) {
        eraserCanvas.parentNode.removeChild(eraserCanvas);
      }
    };
  }, []);

  // Rasterize fabric canvas to eraser canvas for true pixel erasing
  const rasterizeToEraserCanvas = useCallback(() => {
    if (!fabricCanvas || !eraserCanvasRef.current) return;
    
    const eraserCanvas = eraserCanvasRef.current;
    const ctx = eraserCanvas.getContext('2d');
    if (!ctx) return;

    // Clear eraser canvas
    ctx.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
    
    // Draw fabric canvas content onto eraser canvas
    const fabricElement = fabricCanvas.getElement();
    ctx.drawImage(fabricElement, 0, 0);
    
    // Hide fabric canvas objects and show eraser canvas
    fabricCanvas.getObjects().forEach(obj => obj.set('visible', false));
    fabricCanvas.renderAll();
    eraserCanvas.style.display = 'block';
    
    rasterizedRef.current = true;
  }, [fabricCanvas]);

  // Apply erased canvas back to fabric
  const applyErasedCanvas = useCallback(() => {
    if (!fabricCanvas || !eraserCanvasRef.current || !rasterizedRef.current) return;
    
    const eraserCanvas = eraserCanvasRef.current;
    
    // Clear all objects from fabric canvas
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    
    // Create an image from the eraser canvas and add it to fabric
    const dataURL = eraserCanvas.toDataURL();
    
    fabric.Image.fromURL(dataURL).then((img) => {
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      
      // Save the canvas state
      const json = JSON.stringify(fabricCanvas.toJSON());
      onSave(json);
    });
    
    // Hide eraser canvas
    eraserCanvas.style.display = 'none';
    rasterizedRef.current = false;
  }, [fabricCanvas, onSave]);

  // Handle eraser mode with true pixel erasing
  useEffect(() => {
    if (!fabricCanvas || !containerRef.current) return;

    const container = containerRef.current;
    
    const eraseAtPoint = (x: number, y: number) => {
      if (!eraserCanvasRef.current) return;
      
      const ctx = eraserCanvasRef.current.getContext('2d');
      if (!ctx) return;
      
      const eraserRadius = brushSize * 2;
      
      // If we have a last point, draw a line of erasing circles for smooth erasing
      if (lastPointRef.current) {
        const dx = x - lastPointRef.current.x;
        const dy = y - lastPointRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(distance / (eraserRadius / 2)));
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const px = lastPointRef.current.x + dx * t;
          const py = lastPointRef.current.y + dy * t;
          
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.arc(px, py, eraserRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      lastPointRef.current = { x, y };
    };

    const getPointerPosition = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = 'touches' in e ? e.touches[0] : null;
      const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!isEraser) return;
      
      isErasingRef.current = true;
      lastPointRef.current = null;
      
      // Rasterize on first erase
      if (!rasterizedRef.current) {
        rasterizeToEraserCanvas();
      }
      
      const pos = getPointerPosition(e);
      eraseAtPoint(pos.x, pos.y);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isEraser || !isErasingRef.current) return;
      
      const pos = getPointerPosition(e);
      eraseAtPoint(pos.x, pos.y);
    };

    const handlePointerUp = () => {
      if (!isEraser || !isErasingRef.current) return;
      
      isErasingRef.current = false;
      lastPointRef.current = null;
      
      // Apply erased content back to fabric canvas
      applyErasedCanvas();
    };

    if (isEraser) {
      container.addEventListener('mousedown', handlePointerDown);
      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('mouseup', handlePointerUp);
      container.addEventListener('mouseleave', handlePointerUp);
      container.addEventListener('touchstart', handlePointerDown);
      container.addEventListener('touchmove', handlePointerMove);
      container.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('mouseleave', handlePointerUp);
      container.removeEventListener('touchstart', handlePointerDown);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('touchend', handlePointerUp);
    };
  }, [fabricCanvas, isEraser, brushSize, rasterizeToEraserCanvas, applyErasedCanvas]);

  // Update brush settings
  useEffect(() => {
    if (!fabricCanvas) return;

    if (isEraser) {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.hoverCursor = 'crosshair';
    } else {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'move';
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = activeColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }
    }
  }, [activeColor, brushSize, isEraser, fabricCanvas]);

  // Save canvas data on changes
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleChange = () => {
      const json = JSON.stringify(fabricCanvas.toJSON());
      onSave(json);
    };

    fabricCanvas.on('path:created', handleChange);
    fabricCanvas.on('object:modified', handleChange);

    return () => {
      fabricCanvas.off('path:created', handleChange);
      fabricCanvas.off('object:modified', handleChange);
    };
  }, [fabricCanvas, onSave]);

  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.renderAll();
    
    // Also clear eraser canvas
    if (eraserCanvasRef.current) {
      const ctx = eraserCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, eraserCanvasRef.current.width, eraserCanvasRef.current.height);
      }
      eraserCanvasRef.current.style.display = 'none';
    }
    rasterizedRef.current = false;
    
    onSave('');
  }, [fabricCanvas, onSave]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={!isEraser ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setIsEraser(false)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Draw
        </Button>
        <Button
          variant={isEraser ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setIsEraser(true)}
          className="gap-2"
        >
          <Eraser className="h-4 w-4" />
          Erase
        </Button>

        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="gap-2"
          >
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: activeColor }}
            />
            <Palette className="h-4 w-4" />
          </Button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-popover border border-border rounded-lg shadow-lg z-10 flex gap-1 animate-scale-in">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    activeColor === color ? "border-primary scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setActiveColor(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground">Size:</span>
          <Slider
            value={[brushSize]}
            onValueChange={([value]) => setBrushSize(value)}
            min={1}
            max={20}
            step={1}
            className="w-24"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="ml-auto text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="rounded-lg border border-border bg-canvas-bg canvas-grid overflow-hidden relative"
      >
        <canvas ref={canvasRef} className="w-full" />
      </div>
    </div>
  );
};
