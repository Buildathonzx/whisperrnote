import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, resolveCurrentUser, getNoteAttachment, deleteNoteAttachment, generateSignedAttachmentURL, verifySignedAttachmentURL } from '@/lib/appwrite';

// GET single attachment metadata or raw file (?raw=1)
export async function GET(req: NextRequest, { params }: { params: { noteId: string, attachmentId: string } }) {
  try {
    const user = await resolveCurrentUser(req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.log('[attachments.api] GET single start', { noteId: params.noteId, attachmentId: params.attachmentId, userId: user.$id, t: Date.now() });
    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const attachments: any[] = Array.isArray(note.attachments) ? note.attachments.map((a: string) => { try { return JSON.parse(a); } catch { return null; } }).filter(Boolean) : [];
    const meta = attachments.find(a => a.id === params.attachmentId);
    if (!meta) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });

    const urlObj = req.nextUrl;
    const raw = urlObj.searchParams.get('raw');

    // If not raw, provide metadata plus (if enabled) a short-lived signed URL to download
    if (!raw) {
      let signed: any = null;
      try {
        const ownerId = note.userId;
        signed = generateSignedAttachmentURL(params.noteId, ownerId, params.attachmentId);
      } catch (e) {
        signed = null;
      }
      console.log('[attachments.api] GET single done', { noteId: params.noteId, attachmentId: params.attachmentId, t: Date.now(), signed: !!signed });
      return NextResponse.json({ attachment: meta, url: signed?.url || null, expiresAt: signed?.expiresAt || null });
    }

    // raw download request: redirect to signed URL if available else fallback JSON (legacy)
    try {
      const ownerId = note.userId;
      const signed = generateSignedAttachmentURL(params.noteId, ownerId, params.attachmentId);
      if (signed?.url) {
        return NextResponse.redirect(signed.url);
      }
    } catch {/* ignore */}
    try {
      const file: any = await getNoteAttachment(params.attachmentId);
      return NextResponse.json({ file, meta });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'File retrieval failed' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('attachment.get.error', { noteId: params.noteId, attachmentId: params.attachmentId, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE attachment
export async function DELETE(_req: NextRequest, { params }: { params: { noteId: string, attachmentId: string } }) {
  try {
    const user = await resolveCurrentUser(_req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.log('[attachments.api] DELETE start', { noteId: params.noteId, attachmentId: params.attachmentId, userId: user.$id, t: Date.now() });
    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const attachments: string[] = Array.isArray(note.attachments) ? note.attachments : [];
    let removedMeta: any = null;
    const filtered = attachments.filter(raw => {
      try { const obj = JSON.parse(raw); if (obj.id === params.attachmentId) { removedMeta = obj; return false; } } catch { /* keep if parse fails */ }
      return true;
    });

    if (!removedMeta) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });

    await deleteNoteAttachment(params.attachmentId);
    await updateNote(params.noteId, { attachments: filtered });

    console.log('[attachments.api] DELETE done', { noteId: params.noteId, attachmentId: params.attachmentId, t: Date.now() });
    return NextResponse.json({ removed: removedMeta });
  } catch (e: any) {
    console.error('attachment.delete.error', { noteId: params.noteId, attachmentId: params.attachmentId, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 });
  }
}
