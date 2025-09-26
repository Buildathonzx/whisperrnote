"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '@/lib/utils';

interface AttachmentMeta {
  id: string;
  name: string;
  size: number;
  mime: string | null;
  createdAt: string;
}

interface AttachmentResponse {
  attachment: AttachmentMeta;
  url: string | null;
  expiresAt?: number | null;
  ttl?: number | null;
}

export default function AttachmentPage() {
  const params = useParams();
  const noteId = params?.id as string | undefined;
  const attachmentId = params?.attachmentId as string | undefined;

  const [data, setData] = useState<AttachmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId || !attachmentId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/notes/${noteId}/attachments/${attachmentId}`);
        if (!res.ok) throw new Error('Failed to load attachment');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load attachment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [noteId, attachmentId]);

  const meta = data?.attachment;
  const signedUrl = data?.url || null;
  const fallbackRaw = noteId && attachmentId ? `/api/notes/${noteId}/attachments/${attachmentId}?raw=1` : undefined;
  const downloadHref = signedUrl || fallbackRaw || '#';

  const isImage = meta?.mime?.startsWith('image/');
  const isText = meta?.mime?.startsWith('text/');
  const isPDF = meta?.mime === 'application/pdf';

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/notes/${noteId}`} aria-label="Back to note">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold truncate max-w-[50vw]">
            {meta?.name || 'Attachment'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {downloadHref !== '#' && (
            <Button asChild size="sm" variant="secondary">
              <a href={downloadHref} target="_blank" rel="noopener noreferrer" download>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading attachment...</div>}
      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}

      {!loading && !error && meta && (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 shrink-0 space-y-4 border rounded-xl p-4 bg-card h-fit">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Name</p>
              <p className="text-sm font-semibold break-all">{meta.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium">{formatFileSize(meta.size)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{meta.mime || 'unknown'}</p>
              </div>
              {data?.expiresAt && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">URL Expires</p>
                  <p className="font-medium">{new Date(data.expiresAt).toLocaleTimeString()}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {signedUrl && (
                <Button variant="outline" asChild size="sm">
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">Open Signed URL</a>
                </Button>
              )}
              {fallbackRaw && (
                <Button variant="outline" asChild size="sm">
                  <a href={fallbackRaw} target="_blank" rel="noopener noreferrer">Raw</a>
                </Button>
              )}
            </div>
          </aside>

          <div className="flex-1 min-h-[50vh] border rounded-xl bg-muted/30 flex items-center justify-center p-4 relative overflow-auto">
            {!signedUrl && !fallbackRaw && (
              <div className="text-sm text-muted-foreground">No preview available.</div>
            )}
            {(isImage && (signedUrl || fallbackRaw)) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl || fallbackRaw}
                alt={meta.name}
                className="max-h-full max-w-full object-contain rounded shadow"
              />
            )}
            {isPDF && (signedUrl || fallbackRaw) && (
              <iframe
                title={meta.name}
                src={signedUrl || fallbackRaw}
                className="w-full h-[80vh] rounded"
              />
            )}
            {isText && (signedUrl || fallbackRaw) && (
              <iframe
                title={meta.name}
                src={signedUrl || fallbackRaw}
                className="w-full h-[80vh] rounded bg-background"
              />
            )}
            {!isImage && !isText && !isPDF && (signedUrl || fallbackRaw) && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Preview not supported for this file type.</p>
                <Button asChild size="sm">
                  <a href={downloadHref} target="_blank" rel="noopener noreferrer" download>Download File</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


