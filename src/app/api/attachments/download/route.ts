'use server';

import { NextResponse } from 'next/server';
import { storage, APPWRITE_BUCKET_NOTES_ATTACHMENTS, getNote, getCurrentUser } from '@/lib/appwrite';
import crypto from 'crypto';

const ATTACHMENT_URL_SIGNING_SECRET = process.env.ATTACHMENT_URL_SIGNING_SECRET || '';

function verifySignature(noteId: string, ownerId: string, fileId: string, exp: number, sig: string) {
  if (!ATTACHMENT_URL_SIGNING_SECRET) return false;
  const h = crypto.createHmac('sha256', ATTACHMENT_URL_SIGNING_SECRET);
  h.update(`${noteId}.${ownerId}.${fileId}.${exp}`);
  const expected = h.digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex')); } catch { return false; }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const noteId = url.searchParams.get('noteId') || '';
    const ownerId = url.searchParams.get('ownerId') || '';
    const fileId = url.searchParams.get('fileId') || '';
    const expStr = url.searchParams.get('exp') || '';
    const sig = url.searchParams.get('sig') || '';

    if (!noteId || !ownerId || !fileId || !expStr || !sig) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    const exp = parseInt(expStr, 10);
    if (!exp || exp < Math.floor(Date.now()/1000)) {
      return NextResponse.json({ error: 'URL expired' }, { status: 410 });
    }
    if (!verifySignature(noteId, ownerId, fileId, exp, sig)) {
      return NextResponse.json({ error: 'Forbidden (invalid signature)' }, { status: 403 });
    }

    // Ensure current user is the owner (or in future: collaborator)
    const user = await getCurrentUser();
    if (!user?.$id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.$id !== ownerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const note = await getNote(noteId);
    if (!note || note.userId !== ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch file from Appwrite storage
    // We use getFileView via REST: redirect to the underlying Appwrite view endpoint for simplicity
    const viewUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_NOTES_ATTACHMENTS}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    return NextResponse.redirect(viewUrl, 302);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Download failed' }, { status: 500 });
  }
}
