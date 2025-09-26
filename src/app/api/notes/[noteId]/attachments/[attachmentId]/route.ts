import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, getCurrentUser, getNoteAttachment, deleteNoteAttachment, generateSignedAttachmentURL, verifySignedAttachmentURL } from '@/lib/appwrite';

// GET single attachment metadata or raw file (?raw=1)
export async function GET(req: NextRequest, { params }: { params: { noteId: string, attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const attachments: any[] = Array.isArray(note.attachments) ? note.attachments.map((a: string) => { try { return JSON.parse(a); } catch { return null; } }).filter(Boolean) : [];
    const meta = attachments.find(a => a.id === params.attachmentId);
    if (!meta) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });

    const url = req.nextUrl;
    const raw = url.searchParams.get('raw');
    if (raw) {
      // For raw file serve a signed URL redirect if available
      try {
        const signed = await generateSignedAttachmentURL(params.attachmentId, { noteId: params.noteId });
        if (signed?.url) {
          return NextResponse.redirect(signed.url);
        }
      } catch {/* fallback below */}
      try {
        const file: any = await getNoteAttachment(params.attachmentId);
        // We cannot stream via SDK easily here without extra fetch; return meta if streaming not implemented
        return NextResponse.json({ file, meta });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'File retrieval failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ attachment: meta });
  } catch (e: any) {
    console.error('attachment.get.error', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE attachment
export async function DELETE(_req: NextRequest, { params }: { params: { noteId: string, attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({ removed: removedMeta });
  } catch (e: any) {
    console.error('attachment.delete.error', e);
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 });
  }
}
