'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite';
import { listAttachments, deleteAttachment, getSignedDownload, AttachmentError } from '@/lib/attachments/service';

// GET -> return signed/temporary download URL metadata (or disabled state)
export async function GET(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const attachments = await listAttachments(params.noteId, user.$id);
    const meta = attachments.find(a => a.id === params.attachmentId);
    if (!meta) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const signed = await getSignedDownload(params.noteId, params.attachmentId, user.$id);
    return NextResponse.json({ attachment: meta, url: signed.url, expiresAt: signed.expiresAt || null, ttl: signed.ttl || null, signing: signed.signing, reason: signed.reason || null });
  } catch (e: any) {
    if (e instanceof AttachmentError) {
      if (e.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (e.code === 'FORBIDDEN') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (e.code === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || 'Failed to fetch attachment metadata' }, { status: 500 });
  }
}

// DELETE -> remove attachment (owner-only for now, via service layer)
export async function DELETE(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const result = await deleteAttachment(params.noteId, params.attachmentId);
    return NextResponse.json(result);
  } catch (e: any) {
    if (e instanceof AttachmentError) {
      if (e.code === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (e.code === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (e.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || 'Failed to delete attachment' }, { status: 500 });
  }
}
