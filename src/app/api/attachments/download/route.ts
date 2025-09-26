'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, listNoteAttachments, verifySignedAttachmentURL, APPWRITE_BUCKET_NOTES_ATTACHMENTS } from '@/lib/appwrite';

// GET /api/attachments/download?noteId=...&ownerId=...&fileId=...&exp=...&sig=...
// Validates HMAC signature and that the requesting user is either the owner or a collaborator.
// On success returns a 302 redirect to the Appwrite file view endpoint.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId') || '';
    const ownerId = searchParams.get('ownerId') || '';
    const fileId = searchParams.get('fileId') || '';
    const exp = searchParams.get('exp') || '';
    const sig = searchParams.get('sig') || '';

    if (!noteId || !ownerId || !fileId || !exp || !sig) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const verification = verifySignedAttachmentURL({ noteId, ownerId, fileId, exp, sig });
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid or expired link', reason: verification.reason }, { status: verification.reason === 'expired' ? 410 : 400 });
    }

    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const note = await getNote(noteId);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.userId !== ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Owner or collaborator access check
    if (note.userId !== user.$id) {
      try {
        const { listCollaborators } = await import('@/lib/appwrite');
        const collabs: any = await listCollaborators(noteId);
        const allowed = Array.isArray(collabs?.documents) && collabs.documents.some((c: any) => c.userId === user.$id);
        if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    // Ensure attachment belongs to the note
    const attachments = await listNoteAttachments(noteId);
    const meta = attachments.find(a => a.id === fileId);
    if (!meta) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Construct Appwrite file view URL
    const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '') || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const directUrl = `${endpoint}/storage/buckets/${APPWRITE_BUCKET_NOTES_ATTACHMENTS}/files/${fileId}/view?project=${projectId}`;
    return NextResponse.redirect(directUrl, { status: 302 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Download failed' }, { status: 500 });
  }
}
