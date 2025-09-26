import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import AttachmentsManager from '@/components/AttachmentsManager';
import { formatFileSize } from '@/lib/utils';

interface AttachmentMeta { id: string; name: string; size: number; mime: string | null; }

const AttachmentChips: React.FC<{ noteId: string }> = ({ noteId }) => {
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}/attachments`);
        if (!res.ok) return;
        const j = await res.json();
        if (!cancelled) setAttachments(Array.isArray(j.attachments)? j.attachments: []);
      } catch {}
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [noteId]);
  if (!loaded) {
    return (
      <div className="flex flex-wrap gap-2 mt-4" aria-hidden>
        {Array.from({length:3}).map((_,i)=>(
          <div key={i} className="h-5 w-20 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {attachments.map(a => (
        <a key={a.id} href={`/notes/${noteId}/${a.id}`} className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-[11px] hover:bg-accent/20 transition" title={`${a.name} • ${formatFileSize(a.size)}${a.mime? ' • '+a.mime:''}`}>{truncate(a.name,18)}</a>
      ))}
    </div>
  );
};

function truncate(s: string, n: number){ return s.length>n? s.slice(0,n-1)+'…': s; }


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

        {/* Attachments Manager */}
        {/** Expect parent to provide a saved noteId in future; using placeholder logic for now */}
        {/* If note ID availability is required, this component can be rendered conditionally. */}
        {/* @ts-ignore - placeholder noteId until integrated with actual note persistence flow */}
        <div>
          {/* Replace 'temp-note-id' with actual note id when available */}
          <AttachmentsManager noteId={(globalThis as any).currentNoteId || 'temp-note-id'} />
          <AttachmentChips noteId={(globalThis as any).currentNoteId || 'temp-note-id'} />
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
