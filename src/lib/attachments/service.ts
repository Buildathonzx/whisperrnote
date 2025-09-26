import { addAttachmentToNote, listNoteAttachments, removeAttachmentFromNote, generateSignedAttachmentURL, getNote, getCurrentUser } from '@/lib/appwrite';

// Unified attachment metadata (superset of legacy EmbeddedAttachmentMeta)
export interface AttachmentMeta {
  id: string;           // storage file id
  noteId: string;       // parent note id
  ownerId: string;      // uploader user id
  filename: string;     // original (sanitized) filename
  sizeBytes: number;    // size in bytes
  mimetype: string | null; // mime type (may be null)
  createdAt: string;    // ISO timestamp
  checksum?: string;    // optional sha256 hex (future)
  // Additional future fields: deletedAt, createdBy display, metadata
}

export interface SignedDownloadResult {
  url: string | null;        // proxy or direct URL
  expiresAt?: number;        // ms epoch
  ttl?: number;              // seconds
  signing?: 'enabled' | 'disabled';
  reason?: string;           // if signing disabled or failure
}

// Error helper
export class AttachmentError extends Error {
  code: string;
  details?: any;
  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// Internal permission check (placeholder expands with collaborator/public logic later)
async function ensureCanView(noteId: string, userId: string) {
  const note: any = await getNote(noteId);
  if (!note) throw new AttachmentError('NOT_FOUND', 'Note not found');
  if (note.userId === userId) return { note, role: 'owner' };
  try {
    const { listCollaborators } = await import('@/lib/appwrite');
    const collabs: any = await listCollaborators(noteId);
    const allowed = Array.isArray(collabs?.documents) && collabs.documents.some((c: any) => c.userId === userId);
    if (allowed) return { note, role: 'collaborator' };
  } catch {}
  throw new AttachmentError('FORBIDDEN', 'No access to note');
}

async function ensureCanModify(noteId: string, userId: string) {
  const ctx = await ensureCanView(noteId, userId);
  // Currently only owners can modify (legacy behavior). Will expand later.
  if (ctx.role !== 'owner') throw new AttachmentError('FORBIDDEN', 'Insufficient permission to modify attachments');
  return ctx;
}

// List attachments using existing legacy+collection merge helper
export async function listAttachments(noteId: string, currentUserId: string) {
  await ensureCanView(noteId, currentUserId); // will throw if not allowed
  const metas = await listNoteAttachments(noteId, currentUserId);
  // Map legacy metas to unified shape (ownerId unknown for legacy entries -> use note owner)
  const note: any = await getNote(noteId);
  const ownerId = note?.userId || 'unknown';
  return metas.map(m => ({
    id: m.id,
    noteId,
    ownerId, // legacy does not store per-attachment owner distinct from note owner
    filename: m.name,
    sizeBytes: m.size,
    mimetype: m.mime,
    createdAt: m.createdAt,
  } as AttachmentMeta));
}

// Create/upload wrapper delegating to existing addAttachmentToNote
export async function createAttachment(noteId: string, file: File) {
  const user = await getCurrentUser();
  if (!user?.$id) throw new AttachmentError('UNAUTHENTICATED', 'User not authenticated');
  await ensureCanModify(noteId, user.$id);
  const meta: any = await addAttachmentToNote(noteId, file);
  return {
    id: meta.id,
    noteId,
    ownerId: user.$id,
    filename: meta.name,
    sizeBytes: meta.size,
    mimetype: meta.mime,
    createdAt: meta.createdAt,
  } as AttachmentMeta;
}

export async function deleteAttachment(noteId: string, attachmentId: string) {
  const user = await getCurrentUser();
  if (!user?.$id) throw new AttachmentError('UNAUTHENTICATED', 'User not authenticated');
  await ensureCanModify(noteId, user.$id);
  const res = await removeAttachmentFromNote(noteId, attachmentId);
  if (!res?.removed) throw new AttachmentError('NOT_FOUND', 'Attachment not found on note');
  return { removed: true };
}

export async function getSignedDownload(noteId: string, attachmentId: string, currentUserId: string): Promise<SignedDownloadResult> {
  await ensureCanView(noteId, currentUserId);
  const note: any = await getNote(noteId);
  const ownerId = note?.userId || currentUserId;
  const signed = generateSignedAttachmentURL(noteId, ownerId, attachmentId);
  if (!signed) {
    return { url: null, signing: 'disabled', reason: 'signing_disabled' };
  }
  return { url: signed.url, expiresAt: signed.expiresAt, ttl: signed.ttl, signing: 'enabled' };
}
