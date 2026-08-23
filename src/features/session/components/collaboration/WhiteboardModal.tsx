import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  PenTool,
  Eraser,
  Square,
  Circle,
  Minus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { WhiteboardDrawElement, WhiteboardPayload } from '../../types';

interface WhiteboardModalProps {
  isOpen: boolean;
  elements: WhiteboardDrawElement[];
  currentTool: 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle';
  currentColor: string;
  currentWidth: number;
  onClose: () => void;
  onToolChange: (tool: 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle') => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onAddElement: (element: WhiteboardDrawElement) => void;
  onClear: () => void;
  onUndo: () => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ffffff'];

export const WhiteboardModal: React.FC<WhiteboardModalProps> = ({
  isOpen,
  elements,
  currentTool,
  currentColor,
  currentWidth,
  onClose,
  onToolChange,
  onColorChange,
  onWidthChange,
  onAddElement,
  onClear,
  onUndo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentElementRef = useRef<WhiteboardDrawElement | null>(null);

  // Redraw Canvas whenever elements change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render elements
    elements.forEach((el) => {
      ctx.strokeStyle = el.tool === 'eraser' ? '#0f172a' : el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.tool === 'pencil' || el.tool === 'eraser') {
        if (el.points && el.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          el.points.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
      } else if (el.tool === 'line' && el.startX !== undefined && el.startY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(el.startX, el.startY);
        ctx.lineTo(el.endX || el.startX, el.endY || el.startY);
        ctx.stroke();
      } else if (el.tool === 'rectangle' && el.startX !== undefined && el.startY !== undefined) {
        const width = (el.endX || el.startX) - el.startX;
        const height = (el.endY || el.startY) - el.startY;
        ctx.strokeRect(el.startX, el.startY, width, height);
      } else if (el.tool === 'circle' && el.startX !== undefined && el.startY !== undefined) {
        const radius = Math.sqrt(
          Math.pow((el.endX || el.startX) - el.startX, 2) +
            Math.pow((el.endY || el.startY) - el.startY, 2),
        );
        ctx.beginPath();
        ctx.arc(el.startX, el.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [elements, isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const newElement: WhiteboardDrawElement = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tool: currentTool,
      color: currentColor,
      strokeWidth: currentTool === 'eraser' ? currentWidth * 3 : currentWidth,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      points: [{ x, y }],
    };

    currentElementRef.current = newElement;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElementRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const el = currentElementRef.current;
    if (el.tool === 'pencil' || el.tool === 'eraser') {
      el.points = [...(el.points || []), { x, y }];
    } else {
      el.endX = x;
      el.endY = y;
    }

    // Direct preview on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = el.tool === 'eraser' ? '#0f172a' : el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.tool === 'pencil' || el.tool === 'eraser') {
      const pts = el.points || [];
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentElementRef.current) {
      onAddElement(currentElementRef.current);
    }
    setIsDrawing(false);
    currentElementRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full h-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Whiteboard Top Toolbar */}
        <div className="h-14 px-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto select-none">
          {/* Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToolChange('pencil')}
              className={`p-2 rounded-xl transition-colors ${
                currentTool === 'pencil'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Bút vẽ"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToolChange('eraser')}
              className={`p-2 rounded-xl transition-colors ${
                currentTool === 'eraser'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Tẩy"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToolChange('line')}
              className={`p-2 rounded-xl transition-colors ${
                currentTool === 'line'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Đường thẳng"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToolChange('rectangle')}
              className={`p-2 rounded-xl transition-colors ${
                currentTool === 'rectangle'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Hình chữ nhật"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToolChange('circle')}
              className={`p-2 rounded-xl transition-colors ${
                currentTool === 'circle'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Hình tròn"
            >
              <Circle className="w-4 h-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1.5 border-l border-r border-slate-800 px-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  currentColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Stroke Width & Actions */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={15}
              value={currentWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-20 accent-amber-500"
              title="Kích thước nét vẽ"
            />
            <button
              onClick={onUndo}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Hoàn tác (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClear}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              title="Xoá toàn bộ bảng"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              title="Đóng bảng vẽ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
