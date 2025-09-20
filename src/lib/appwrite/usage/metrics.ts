import { databases, Query } from '../core/client';
import { APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, APPWRITE_COLLECTION_ID_APIKEYS, APPWRITE_COLLECTION_ID_COLLABORATORS } from '../core/client';

// Counting helpers kept lightweight; callers can layer caching if needed.

export async function countUserNotes(userId: string): Promise<number> {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_NOTES,
      [Query.equal('userId', userId), Query.limit(1)] as any
    );
    return res.total ?? res.documents.length;
  } catch {
    return 0;
  }
}

export async function countUserApiKeys(userId: string): Promise<number> {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_APIKEYS,
      [Query.equal('userId', userId), Query.limit(1)] as any
    );
    return res.total ?? res.documents.length;
  } catch {
    return 0;
  }
}

export async function countNoteCollaborators(noteId: string): Promise<number> {
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [Query.equal('noteId', noteId), Query.limit(1)] as any
    );
    return res.total ?? res.documents.length;
  } catch {
    return 0;
  }
}

// Placeholder: counts AI generations for current billing month.
// TODO: integrate with actual AI generation logging collection.
export async function getMonthlyAIGenerationCount(userId: string, _now: Date = new Date()): Promise<number> {
  // Currently returns 0 until AI usage logging is implemented.
  return 0;
}

// Approximate storage usage (sum of attachment file sizes) - placeholder.
// A more accurate approach would paginate through storage files with user prefix meta.
export async function approximateUserStorageUsage(_userId: string): Promise<number> {
  // Returns 0 MB for now (implement when file metadata includes user ownership references)
  return 0;
}
