import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, getCurrentUser, getCurrentUserFromRequest, uploadNoteAttachment } from '@/lib/appwrite';

// GET: list attachments (embedded in note.attachments array as JSON strings)
export async function GET(_req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    let user = await getCurrentUser();
    if (!user) user = await getCurrentUserFromRequest(_req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trace = { op: 'list', noteId: params.noteId, userId: user.$id, t: Date.now() };
    console.log('[attachments.api] GET start', trace);

    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const attachments: any[] = Array.isArray(note.attachments) ? note.attachments.map((a: string) => {
      try { return JSON.parse(a); } catch { return null; }
    }).filter(Boolean) : [];

    console.log('[attachments.api] GET done', { noteId: params.noteId, count: attachments.length, t: Date.now() });
    return NextResponse.json({ attachments });
  } catch (e: any) {
    console.error('attachments.list.error', { noteId: params.noteId, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST: upload new attachment (single file per request)
export async function POST(req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    let user = await getCurrentUser();
    if (!user) user = await getCurrentUserFromRequest(req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trace = { op: 'upload', noteId: params.noteId, userId: user.$id, t: Date.now() };
    console.log('[attachments.api] POST start', trace);

    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    try {
      const meta = await (await import('@/lib/appwrite')).addAttachmentToNote(params.noteId, file);
      console.log('[attachments.api] POST done', { noteId: params.noteId, attachmentId: meta.id, t: Date.now() });
      return NextResponse.json({ attachment: meta });
    } catch (e: any) {
      // Map known error codes from helper
      const code = e?.code;
      if (code === 'ATTACHMENT_SIZE_LIMIT') {
        return NextResponse.json({ error: e.message, code }, { status: 400 });
      }
      if (code === 'UNSUPPORTED_MIME_TYPE') {
        return NextResponse.json({ error: e.message, code }, { status: 400 });
      }
      if (code === 'PLAN_LIMIT_REACHED') {
        return NextResponse.json({ error: e.message, code }, { status: 400 });
      }
      console.error('attachments.upload.error', { noteId: params.noteId, err: e?.message || String(e), code: e?.code });
      return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('attachments.upload.unhandled', { noteId: params.noteId, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
