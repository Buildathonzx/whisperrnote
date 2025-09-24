'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, addAttachmentToNote, listNoteAttachments } from '@/lib/appwrite';

// List attachments or add a new one (multipart/form-data with field 'file')
export async function GET(_req: Request, { params }: { params: { noteId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId);
    if (!note || note.userId !== user.$id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const attachments = await listNoteAttachments(params.noteId);
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
    const meta = await addAttachmentToNote(params.noteId, file);
    return NextResponse.json({ attachment: meta });
  } catch (e: any) {
    if (e?.code === 'PLAN_LIMIT_REACHED') return NextResponse.json({ error: e.message, code: e.code, limit: e.limit, plan: e.plan }, { status: 429 });
    if (e?.code === 'ATTACHMENT_SIZE_LIMIT') return NextResponse.json({ error: e.message, code: e.code }, { status: 413 });
    if (e?.message === 'Only owner can add attachments currently') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
