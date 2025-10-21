import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import AttachmentsManager from '@/components/AttachmentsManager';
import NoteContent from '@/components/NoteContent';
import { formatFileSize } from '@/lib/utils';
import { createNote, updateNote, getNote } from '@/lib/appwrite';

interface AttachmentMeta { id: string; name: string; size: number; mime: string | null; }

const AttachmentChips: React.FC<{ noteId: string }> = ({ noteId }) => {
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!noteId) return;
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
  if (!noteId) return null;
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
  initialFormat?: 'text' | 'doodle';
  noteId?: string; // existing note id if editing
  onSave?: (note: any) => void; // called after create or update
  onNoteCreated?: (note: any) => void; // called only on first creation
}

export default function NoteEditor({ 
  initialContent = '', 
  initialTitle = '',
  initialFormat = 'text',
  noteId: externalNoteId,
  onSave,
  onNoteCreated
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [format, setFormat] = useState<'text' | 'doodle'>(initialFormat);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalNoteId, setInternalNoteId] = useState<string | undefined>(externalNoteId);
  const effectiveNoteId = internalNoteId || externalNoteId;

  // If external noteId changes (parent supplies), sync
  useEffect(() => {
    if (externalNoteId && externalNoteId !== internalNoteId) {
      setInternalNoteId(externalNoteId);
      // Optionally fetch latest content
      (async () => {
        try {
          const n = await getNote(externalNoteId);
          if (n) {
            setTitle(n.title || '');
            setContent(n.content || '');
            setFormat((n.format as 'text' | 'doodle') || 'text');
          }
        } catch {}
      })();
    }
  }, [externalNoteId]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    try {
      setIsSaving(true);
      setError(null);
      let saved: any;
      if (effectiveNoteId) {
        // update existing
        saved = await updateNote(effectiveNoteId, { 
          title: title.trim(), 
          content: content.trim(),
          format
        });
      } else {
        saved = await createNote({ 
          title: title.trim(), 
          content: content.trim(), 
          format,
          tags: [] 
        });
        setInternalNoteId(saved?.$id || saved?.id);
        onNoteCreated?.(saved);
      }
      onSave?.(saved);
    } catch (err: any) {
      setError(err?.message || 'Failed to save note');
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

        <NoteContent
          format={format}
          content={content}
          onChange={setContent}
          onFormatChange={setFormat}
          disabled={isSaving}
        />

        {/* Attachments only when we have a real note id */}
        {effectiveNoteId && (
          <div>
            <AttachmentsManager noteId={effectiveNoteId} />
            <AttachmentChips noteId={effectiveNoteId} />
          </div>
        )}

        {!effectiveNoteId && (
          <div className="text-xs text-muted-foreground">
            Save the note to enable attachments.
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Saving...' : (effectiveNoteId ? 'Update Note' : 'Save & Enable Attachments')}
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
