import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, resolveCurrentUser, uploadNoteAttachment } from '@/lib/appwrite';

// GET: list attachments (embedded in note.attachments array as JSON strings)
export async function GET(_req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    const user = await resolveCurrentUser(_req as any);
    if (!user) {
      const cookieHeader = _req.headers.get('cookie') || _req.headers.get('Cookie');
      console.warn('[attachments.api] GET auth_failed', { noteId: params.noteId, hasCookie: !!cookieHeader, cookieLength: cookieHeader?.length || 0 });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieHeader = _req.headers.get('cookie') || _req.headers.get('Cookie');
    const trace = { op: 'list', noteId: params.noteId, userId: user.$id, t: Date.now(), hasCookie: !!cookieHeader, cookieLength: cookieHeader?.length || 0 };
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
    const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
    const user = await resolveCurrentUser(req as any);
    if (!user) {
      console.warn('[attachments.api] POST auth_failed', { 
        noteId: params.noteId, 
        hasCookie: !!cookieHeader, 
        cookieLength: cookieHeader?.length || 0,
        authHeader: !!req.headers.get('authorization'),
        method: req.method,
        url: req.url
      });
      return NextResponse.json({ error: 'Unauthorized - no user session' }, { status: 401 });
    }

    const trace = { op: 'upload', noteId: params.noteId, userId: user.$id, t: Date.now(), hasCookie: !!cookieHeader, cookieLength: cookieHeader?.length || 0 };
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
      const meta = await (await import('@/lib/appwrite')).addAttachmentToNote(params.noteId, file, user.$id);
      console.log('[attachments.api] POST done', { noteId: params.noteId, attachmentId: meta.id, t: Date.now() });
      return NextResponse.json({ attachment: meta });
    } catch (e: any) {
      console.error('[attachments.api] upload error details', {
        noteId: params.noteId,
        message: e?.message,
        code: e?.code,
        stack: e?.stack,
        toString: e?.toString(),
        type: typeof e
      });
      
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
      if (code === 'MISSING_BUCKET_ID') {
        return NextResponse.json({ error: e.message, code }, { status: 500 });
      }
      
      const errorMsg = e?.message || String(e) || 'Upload failed';
      return NextResponse.json({ error: errorMsg, code: code || 'UNKNOWN' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('attachments.upload.unhandled', { noteId: params.noteId, err: e?.message || String(e) });
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
