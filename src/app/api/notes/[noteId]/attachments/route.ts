'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, addAttachmentToNote, listNoteAttachments } from '@/lib/appwrite';

// List attachments or add a new one (multipart/form-data with field 'file')
export async function GET(_req: Request, { params }: { params: { noteId: string } }) {
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
    const attachments = await listNoteAttachments(params.noteId, user.$id);
    return NextResponse.json({ attachments });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list attachments' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    // Basic instrumentation for debugging attachment issues
    console.log('[attachments:upload] start', { noteId: params.noteId, name: file.name, size: file.size, type: (file as any).type });
    const meta = await addAttachmentToNote(params.noteId, file);
    console.log('[attachments:upload] success', { noteId: params.noteId, meta });
    return NextResponse.json({ attachment: meta });
  } catch (e: any) {
    if (e?.code === 'PLAN_LIMIT_REACHED') return NextResponse.json({ error: e.message, code: e.code, limit: e.limit, plan: e.plan }, { status: 429 });
    if (e?.code === 'ATTACHMENT_SIZE_LIMIT') return NextResponse.json({ error: e.message, code: e.code }, { status: 413 });
    if (e?.code === 'UNSUPPORTED_MIME_TYPE') return NextResponse.json({ error: e.message, code: e.code, allowed: e.allowed }, { status: 415 });
     if (e?.message === 'Only owner can add attachments currently') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     console.error('[attachments:upload] error', e);
     // Fallback serialization for structured codes already handled above
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
