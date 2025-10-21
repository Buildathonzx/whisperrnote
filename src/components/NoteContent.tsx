'use client';

import React, { useState } from 'react';
import DoodleCanvas from '@/components/DoodleCanvas';
import DoodleViewer from '@/components/DoodleViewer';
import { Button } from '@/components/ui/Button';
import { Pencil2Icon } from '@radix-ui/react-icons';

interface NoteContentProps {
  format?: 'text' | 'doodle';
  content: string;
  onChange: (content: string) => void;
  onFormatChange: (format: 'text' | 'doodle') => void;
  disabled?: boolean;
}

export default function NoteContent({
  format = 'text',
  content,
  onChange,
  onFormatChange,
  disabled = false,
}: NoteContentProps) {
  const [showDoodleEditor, setShowDoodleEditor] = useState(false);

  const handleDoodleSave = (doodleData: string) => {
    onChange(doodleData);
    onFormatChange('doodle');
    setShowDoodleEditor(false);
  };

  const handleEditDoodle = () => {
    setShowDoodleEditor(true);
  };

  const handleSwitchToText = () => {
    onFormatChange('text');
    onChange('');
  };

  const handleSwitchToDoodle = () => {
    setShowDoodleEditor(true);
  };

  if (format === 'doodle') {
    return (
      <div className="space-y-4">
        {content && (
          <DoodleViewer data={content} onEdit={handleEditDoodle} />
        )}

        {!content && (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No doodle yet</p>
            <Button onClick={handleSwitchToDoodle} disabled={disabled}>
              Create Doodle
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          {content && (
            <Button
              variant="outline"
              onClick={handleEditDoodle}
              disabled={disabled}
              className="gap-2"
            >
              <Pencil2Icon className="w-4 h-4" />
              Edit Doodle
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleSwitchToText}
            disabled={disabled}
            size="sm"
          >
            Switch to Text
          </Button>
        </div>

        {showDoodleEditor && (
          <DoodleCanvas
            initialData={content}
            onSave={handleDoodleSave}
            onClose={() => setShowDoodleEditor(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Write your note content here..."
        value={content}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={65000}
        className="w-full min-h-[200px] p-4 border border-border rounded-xl bg-card text-foreground text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="text-sm text-gray-500 text-right">
        {content.length}/65000 characters
      </div>

      <Button
        variant="outline"
        onClick={handleSwitchToDoodle}
        disabled={disabled}
        className="gap-2"
      >
        <Pencil2Icon className="w-4 h-4" />
        Create Doodle
      </Button>

      {showDoodleEditor && (
        <DoodleCanvas
          initialData=""
          onSave={handleDoodleSave}
          onClose={() => setShowDoodleEditor(false)}
        />
      )}
    </div>
  );
}
