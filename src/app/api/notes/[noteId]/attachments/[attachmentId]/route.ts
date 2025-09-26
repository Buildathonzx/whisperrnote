'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, listNoteAttachments, removeAttachmentFromNote, deleteAttachmentRecord, APPWRITE_COLLECTION_ID_ATTACHMENTS, generateSignedAttachmentURL } from '@/lib/appwrite';

// GET -> return a signed/temporary URL (fallback to direct file view) metadata
export async function GET(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

    // Validate attachment exists in embedded metadata
    const attachments = await listNoteAttachments(params.noteId);
    const embedded = attachments.find(a => a.id === params.attachmentId);
    if (!embedded) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Generate signed short-lived URL (fallback null if disabled)
    const signed = generateSignedAttachmentURL(params.noteId, note.userId, embedded.id);
    return NextResponse.json({ attachment: embedded, url: signed?.url || null, expiresAt: signed?.expiresAt || null, ttl: signed?.ttl || null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch attachment metadata' }, { status: 500 });
  }
}

// DELETE -> remove attachment (owner only)
export async function DELETE(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId);
    if (!note || note.userId !== user.$id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await removeAttachmentFromNote(params.noteId, params.attachmentId);
    if (APPWRITE_COLLECTION_ID_ATTACHMENTS) {
      try { await deleteAttachmentRecord(params.attachmentId); } catch {}
    }
    if (!result.removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ removed: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete attachment' }, { status: 500 });
  }
}
