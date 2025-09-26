import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: () => void;
}

export default function NoteEditor({ 
  initialContent = '', 
  initialTitle = '',
  onSave 
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Note: Actual save logic would go here
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-lg">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          className="text-lg font-semibold"
        />

        <textarea
          placeholder="Write your note content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
          maxLength={65000}
          className="w-full min-h-[200px] p-4 border border-border rounded-xl bg-card text-foreground text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div className="text-sm text-gray-500 text-right">
          {content.length}/65000 characters
        </div>

        {/* Attachments Section (simplified placeholder until note persistence integrated) */}
        <div className="border border-dashed border-border rounded-xl p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Attachments (Coming Soon)</p>
          <p className="text-xs text-muted-foreground">Upload and manage files after note save integration.</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || !title || !content}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
