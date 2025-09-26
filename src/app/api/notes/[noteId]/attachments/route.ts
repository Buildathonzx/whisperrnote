import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, getCurrentUser, uploadNoteAttachment } from '@/lib/appwrite';

// GET: list attachments (embedded in note.attachments array as JSON strings)
export async function GET(_req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const attachments: any[] = Array.isArray(note.attachments) ? note.attachments.map((a: string) => {
      try { return JSON.parse(a); } catch { return null; }
    }).filter(Boolean) : [];

    return NextResponse.json({ attachments });
  } catch (e: any) {
    console.error('attachments.list.error', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST: upload new attachment (single file per request)
export async function POST(req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const note = await getNote(params.noteId);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== user.$id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Upload raw file to storage
    const uploaded: any = await uploadNoteAttachment(file);

    // Build metadata entry
    const meta = {
      id: uploaded.$id || uploaded.id,
      name: (file as any).name,
      size: (file as any).size,
      mime: (file as any).type,
      createdAt: new Date().toISOString()
    };

    const existing = Array.isArray(note.attachments) ? note.attachments : [];
    const updated = [...existing, JSON.stringify(meta)];

    await updateNote(params.noteId, { attachments: updated });

    return NextResponse.json({ attachment: meta });
  } catch (e: any) {
    console.error('attachments.upload.error', e);
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
