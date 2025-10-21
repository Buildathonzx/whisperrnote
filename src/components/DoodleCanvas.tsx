'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DoodleStroke } from '@/types/notes';
import { Button } from '@/components/ui/Button';
import { X, Maximize2, Minimize2, RotateCcw, Trash2 } from 'lucide-react';

interface DoodleCanvasProps {
  initialData?: string;
  onSave: (data: string) => void;
  onClose: () => void;
}

type ModalMode = 'modal' | 'pip' | 'fullscreen';

export default function DoodleCanvas({ initialData, onSave, onClose }: DoodleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<ModalMode>('modal');
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Initialize canvas with existing data
  useEffect(() => {
    if (initialData) {
      try {
        const data = JSON.parse(initialData);
        setStrokes(data);
        redrawCanvas(data);
      } catch {
        console.error('Failed to parse doodle data');
      }
    }
  }, []);

  const getCanvas = () => canvasRef.current;

  const redrawCanvas = (strokesData: DoodleStroke[] = strokes) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokesData.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = stroke.opacity ?? 1;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
      }
      ctx.stroke();

      ctx.globalAlpha = 1;
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStrokes((prev) => [
      ...prev,
      { points: [[x, y]], color, size, opacity: 1 },
    ]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokes((prev) => {
      const updated = [...prev];
      const lastStroke = updated[updated.length - 1];
      if (lastStroke) {
        lastStroke.points.push([x, y]);
      }
      return updated;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    onSave(JSON.stringify(strokes));
    onClose();
  };

  const handleClear = () => {
    setStrokes([]);
    const canvas = getCanvas();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handlePipDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-pip-drag]')) {
      setIsDraggingPip(true);
      dragOffset.current = {
        x: e.clientX - pipPosition.x,
        y: e.clientY - pipPosition.y,
      };
    }
  };

  const handlePipDrag = (e: React.MouseEvent) => {
    if (!isDraggingPip) return;

    const newX = Math.max(0, e.clientX - dragOffset.current.x);
    const newY = Math.max(0, e.clientY - dragOffset.current.y);

    setPipPosition({ x: newX, y: newY });
  };

  const handlePipDragEnd = () => {
    setIsDraggingPip(false);
  };

  // Modal layout
  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold">Doodle</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('fullscreen')}
                title="Expand to fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('pip')}
                title="Minimize to PIP"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Close without saving"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border border-slate-300 dark:border-slate-700 rounded bg-white cursor-crosshair w-full h-auto"
            />
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Color:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">{size}px</span>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  title="Undo last stroke"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  title="Clear canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Doodle
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen layout
  if (mode === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold">Doodle - Fullscreen</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('modal')}
              title="Back to modal"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Close without saving"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas area - full height */}
        <div className="flex-1 p-4 overflow-auto">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-slate-300 dark:border-slate-700 rounded bg-white cursor-crosshair w-full h-full"
          />
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-slate-500">{size}px</span>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                title="Undo last stroke"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                title="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Doodle
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PIP layout
  return (
    <div
      className="fixed z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      style={{
        left: `${pipPosition.x}px`,
        top: `${pipPosition.y}px`,
      }}
      onMouseMove={handlePipDrag}
      onMouseUp={handlePipDragEnd}
      onMouseLeave={handlePipDragEnd}
    >
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden w-80">
        {/* PIP Header - Draggable */}
        <div
          data-pip-drag
          className="bg-slate-100 dark:bg-slate-900 px-4 py-2 flex items-center justify-between cursor-move hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          onMouseDown={handlePipDragStart}
        >
          <span className="text-sm font-medium truncate">Doodle</span>
          <div className="flex gap-1">
            <button
              onClick={() => setMode('modal')}
              className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition"
              title="Expand to modal"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded transition"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* PIP Canvas */}
        <div className="w-full aspect-video bg-white">
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {/* PIP Controls - Compact */}
        <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Change color"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="flex-1 h-1"
              title="Change brush size"
            />
          </div>

          <div className="flex gap-1">
            <button
              onClick={handleUndo}
              className="flex-1 p-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Undo"
            >
              <RotateCcw className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={handleClear}
              className="flex-1 p-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Clear"
            >
              <Trash2 className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={handleSave}
              className="flex-1 p-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition text-center"
              title="Save"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
