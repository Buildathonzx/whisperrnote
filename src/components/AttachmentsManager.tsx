import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/lib/utils';
// Simple className join helper (local)
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface AttachmentMeta {
  id: string;
  name: string;
  size: number;
  mime: string | null;
  createdAt: string;
}

interface AttachmentsManagerProps {
  noteId: string;
  className?: string;
}

interface UploadingFile {
  tempId: string;
  file: File;
  progress: number;
  status: 'uploading' | 'error' | 'done';
  error?: string;
}

export const AttachmentsManager: React.FC<AttachmentsManagerProps> = ({ noteId, className }) => {
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchAttachments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/notes/${noteId}/attachments`);
      if (!res.ok) throw new Error('Failed to load attachments');
      const data = await res.json();
      setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId) fetchAttachments();
  }, [noteId, fetchAttachments]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return;
    const toUpload: UploadingFile[] = []; 
    for (const f of Array.from(files)) {
      toUpload.push({ tempId: `${Date.now()}-${Math.random()}`, file: f, progress: 0, status: 'uploading' });
    }
    setUploading(prev => [...prev, ...toUpload]);

    for (const item of toUpload) {
      const form = new FormData();
      form.append('file', item.file);
      try {
        // Use fetch without progress first (Next.js route doesn't stream). Simulate progress.
        item.progress = 10; setUploading(cur => [...cur]);
        const res = await fetch(`/api/notes/${noteId}/attachments`, { method: 'POST', body: form });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Upload failed (${res.status})`);
        }
        item.progress = 100;
        item.status = 'done';
        setUploading(cur => [...cur]);
        await fetchAttachments();
      } catch (e: any) {
        item.status = 'error';
        item.error = e.message || 'Upload failed';
        setUploading(cur => [...cur]);
      }
    }
    // Clean finished successful uploads after short delay
    setTimeout(() => {
      setUploading(cur => cur.filter(u => u.status !== 'done'));
    }, 1200);
  }, [noteId, fetchAttachments]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  const triggerSelect = () => inputRef.current?.click();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };

  const deleteAttachment = async (id: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}/attachments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchAttachments();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  };



  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn('border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer bg-muted/30', dragActive ? 'border-accent bg-accent/10' : 'border-border')}
        onClick={triggerSelect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={onInputChange} />
        <p className="text-sm font-medium">Drag & drop or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Per-file size limited by your plan.</p>
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Uploading</p>
          {uploading.map(u => (
            <div key={u.tempId} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
              <div className="truncate max-w-[50%]">{u.file.name}</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1 bg-border rounded overflow-hidden">
                  <div className={cn('h-full bg-accent transition-all', u.status === 'error' && 'bg-destructive')} style={{ width: `${u.progress}%` }} />
                </div>
                <span>{u.status === 'error' ? 'Error' : `${u.progress}%`}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Attachments</p>
          <Button size="sm" variant="outline" onClick={fetchAttachments} disabled={loading}>Refresh</Button>
        </div>
        {loading && <div className="text-xs text-muted-foreground">Loading...</div>}
        {!loading && attachments.length === 0 && <div className="text-xs text-muted-foreground">No attachments yet.</div>}
        <ul className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
          {attachments.map(a => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs hover:bg-muted/40">
              <div className="flex flex-col min-w-0">
                <span className="truncate font-medium">{a.name}</span>
                <a href={`/notes/${noteId}/${a.id}`} className="text-[10px] text-accent hover:underline">Open</a>
                <span className="text-[10px] text-muted-foreground">{formatFileSize(a.size)} • {a.mime || 'unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/notes/${noteId}/attachments/${a.id}`);
                      if (!res.ok) throw new Error('Failed to get attachment URL');
                      const data = await res.json();
                      const url = data?.url;
                      if (url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        // Fallback: if no signed URL (disabled), attempt direct legacy route (will likely 404 if not implemented)
                        window.open(`/api/notes/${noteId}/attachments/${a.id}?raw=1`, '_blank', 'noopener,noreferrer');
                      }
                    } catch (err) {
                      setError((err as any)?.message || 'Failed to open attachment');
                    }
                  }}
                  className="text-accent hover:underline"
                >View</button>
                <button
                  onClick={() => deleteAttachment(a.id)}
                  className="px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                >Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
    </div>
  );
};

export default AttachmentsManager;
