'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, listNoteAttachments, removeAttachmentFromNote, generateSignedAttachmentURL } from '@/lib/appwrite';

// GET -> return attachment metadata + (optional) signed URL (legacy-compatible, no service layer)
export async function GET(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const note = await getNote(params.noteId) as any;
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Access check: owner or collaborator
    if (note.userId !== user.$id) {
      try {
        const { listCollaborators } = await import('@/lib/appwrite');
        const collabs: any = await listCollaborators(params.noteId);
        const allowed = Array.isArray(collabs?.documents) && collabs.documents.some((c: any) => c.userId === user.$id);
        if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const metas = await listNoteAttachments(params.noteId, user.$id);
    const meta = metas.find(m => m.id === params.attachmentId);
    if (!meta) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const ownerId = note.userId;
    const signed = generateSignedAttachmentURL(params.noteId, ownerId, params.attachmentId);
    if (signed) {
      return NextResponse.json({
        attachment: meta,
        url: signed.url,
        expiresAt: signed.expiresAt,
        ttl: signed.ttl,
        signing: 'enabled',
        reason: null,
      });
    }
    return NextResponse.json({
      attachment: meta,
      url: null,
      expiresAt: null,
      ttl: null,
      signing: 'disabled',
      reason: 'signing_disabled'
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch attachment' }, { status: 500 });
  }
}

// DELETE -> remove attachment (owner only)
export async function DELETE(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId) as any;
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const res = await removeAttachmentFromNote(params.noteId, params.attachmentId);
    if (!res.removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ removed: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete attachment' }, { status: 500 });
  }
}
