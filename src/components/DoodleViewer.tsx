'use client';

import React, { useRef, useEffect } from 'react';
import { DoodleStroke } from '@/types/notes';
import { Button } from '@/components/ui/Button';
import { Edit2 } from 'lucide-react';

interface DoodleViewerProps {
  data: string;
  onEdit?: () => void;
  title?: string;
}

export default function DoodleViewer({ data, onEdit, title }: DoodleViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const strokes: DoodleStroke[] = JSON.parse(data);
      redrawCanvas(strokes);
    } catch {
      console.error('Failed to parse doodle data');
    }
  }, [data]);

  const redrawCanvas = (strokes: DoodleStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
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

  return (
    <div className="w-full space-y-2">
      {title && <h3 className="font-semibold text-sm">{title}</h3>}
      <div className="relative rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto"
        />
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="absolute top-2 right-2 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
