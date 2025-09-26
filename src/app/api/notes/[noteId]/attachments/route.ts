'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite';
import { listAttachments, createAttachment, AttachmentError } from '@/lib/attachments/service';

// List attachments or add a new one (multipart/form-data with field 'file')
export async function GET(_req: Request, { params }: { params: { noteId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const attachments = await listAttachments(params.noteId, user.$id);
    return NextResponse.json({ attachments });
  } catch (e: any) {
    if (e instanceof AttachmentError) {
      if (e.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (e.code === 'FORBIDDEN') return NextResponse.json({ error: 'Not found' }, { status: 404 }); // conceal existence
      return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    }
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
    console.log('[attachments:upload] start', { noteId: params.noteId, name: file.name, size: file.size, type: (file as any).type });
    const meta = await createAttachment(params.noteId, file);
    console.log('[attachments:upload] success', { noteId: params.noteId, meta });
    return NextResponse.json({ attachment: meta });
  } catch (e: any) {
    if (e instanceof AttachmentError) {
      if (e.code === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (e.code === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (e.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (e.code === 'ATTACHMENT_SIZE_LIMIT') return NextResponse.json({ error: e.message, code: e.code }, { status: 413 });
      if (e.code === 'UNSUPPORTED_MIME_TYPE' || e.code === 'MIME_NOT_ALLOWED') return NextResponse.json({ error: e.message, code: e.code }, { status: 415 });
      return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    }
    if (e?.code === 'ATTACHMENT_SIZE_LIMIT') return NextResponse.json({ error: e.message, code: e.code }, { status: 413 });
    if (e?.code === 'UNSUPPORTED_MIME_TYPE') return NextResponse.json({ error: e.message, code: e.code, allowed: e.allowed }, { status: 415 });
    if (e?.message === 'Only owner can add attachments currently') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('[attachments:upload] error', e);
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
