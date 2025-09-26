'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser, getNote, listNoteAttachments, removeAttachmentFromNote, getNoteAttachment, APPWRITE_BUCKET_NOTES_ATTACHMENTS, storage, deleteAttachmentRecord, APPWRITE_COLLECTION_ID_ATTACHMENTS } from '@/lib/appwrite';

// GET -> return a signed/temporary URL (fallback to direct file view) metadata
export async function GET(_req: Request, { params }: { params: { noteId: string; attachmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const note = await getNote(params.noteId);
    if (!note || (note.userId !== user.$id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Validate attachment exists in embedded metadata
    const attachments = await listNoteAttachments(params.noteId);
    const embedded = attachments.find(a => a.id === params.attachmentId);
    if (!embedded) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });

    // For now return direct file preview URL (Appwrite SDK method). In future sign URLs.
    let url: string | null = null;
    try {
      // getFileView returns a Response/URL depending on environment; we build a standard endpoint for client to fetch again
      // Provide the file id so client can build /storage/v1/buckets/... path via SDK
      url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_NOTES_ATTACHMENTS}/files/${embedded.id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    } catch {}

    return NextResponse.json({ attachment: embedded, url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch attachment' }, { status: 500 });
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
    if (!result.removed) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    return NextResponse.json({ removed: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete attachment' }, { status: 500 });
  }
}
