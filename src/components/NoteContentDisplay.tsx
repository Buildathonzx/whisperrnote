'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { DoodleStroke } from '@/types/notes';
import DoodleCanvas from '@/components/DoodleCanvas';

interface NoteContentDisplayProps {
  content: string;
  format?: 'text' | 'doodle';
  className?: string;
  preview?: boolean;
  onEditDoodle?: () => void;
}

export function NoteContentDisplay({
  content,
  format = 'text',
  className = '',
  preview = false,
  onEditDoodle,
}: NoteContentDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse and validate doodle data
  const doodleData = useMemo(() => {
    if (format !== 'doodle' || !content) return null;
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : null;
    } catch {
      console.error('Invalid doodle data');
      return null;
    }
  }, [content, format]);

  // Render doodle on canvas
  useEffect(() => {
    if (format !== 'doodle' || !doodleData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    doodleData.forEach((stroke: DoodleStroke) => {
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
  }, [doodleData, format]);

  // Render based on format
  if (format === 'doodle') {
    if (!doodleData) {
      return (
        <div className={`text-center py-6 text-muted ${className}`}>
          <p>Invalid doodle data</p>
        </div>
      );
    }

    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        <canvas
          ref={canvasRef}
          width={preview ? 400 : 800}
          height={preview ? 300 : 600}
          className={`w-full ${!preview ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          onClick={!preview && onEditDoodle ? onEditDoodle : undefined}
          style={{ display: 'block' }}
        />
        {!preview && onEditDoodle && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
            <span className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
              Click to edit
            </span>
          </div>
        )}
      </div>
    );
  }

  // Text format - return raw content for parent to render
  return null;
}

export default NoteContentDisplay;
