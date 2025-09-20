import { databases, ID, Query } from '../core/client';
import { APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS } from '../core/client';
import type { Tags } from '@/types/appwrite';
import { getCurrentUser } from '../auth';

// Internal helper exported for reuse by notes module
export async function adjustTagUsage(userId: string | null | undefined, tagName: string, delta: number) {
  try {
    if (!userId || !tagName) return;
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_TAGS,
      [Query.equal('userId', userId), Query.equal('name', tagName), Query.limit(1)] as any
    );
    if (res.documents.length) {
      const doc: any = res.documents[0];
      const current = typeof doc.usageCount === 'number' && !isNaN(doc.usageCount) ? doc.usageCount : 0;
      const next = current + delta;
      if (next >= 0 && next !== current) {
        try {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_TAGS,
            doc.$id,
            { usageCount: next }
          );
        } catch {}
      }
    }
  } catch {}
}

function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = data as any;
  return cleanData;
}

export async function createTag(data: Partial<Tags>) {
  const user = await getCurrentUser();
  if (!user?.$id) throw new Error('User not authenticated');
  const now = new Date().toISOString();
  const cleanData = cleanDocumentData(data);
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_TAGS,
    ID.unique(),
    { ...cleanData, userId: user.$id, id: null, createdAt: now }
  );
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_TAGS,
    doc.$id,
    { id: doc.$id }
  );
  return await getTag(doc.$id);
}

export async function getTag(tagId: string): Promise<Tags> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId) as Promise<Tags>;
}

export async function updateTag(tagId: string, data: Partial<Tags>) {
  const { id, userId, ...rest } = data;
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId, cleanDocumentData(rest));
}

export async function deleteTag(tagId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId);
}

export async function listTags(queries: any[] = [], limit: number = 100) {
  if (!queries.length) {
    const user = await getCurrentUser();
    if (!user?.$id) return { documents: [], total: 0 };
    queries = [Query.equal('userId', user.$id)];
  }
  const finalQueries = [...queries, Query.limit(limit), Query.orderDesc('$createdAt')];
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, finalQueries);
  return { ...res, documents: res.documents as unknown as Tags[] };
}

export async function getAllTags(): Promise<{ documents: Tags[]; total: number }> {
  const user = await getCurrentUser();
  if (!user?.$id) return { documents: [], total: 0 };
  let all: Tags[] = [];
  let cursor: string | undefined;
  const batch = 100;
  while (true) {
    const queries: any[] = [Query.equal('userId', user.$id), Query.limit(batch), Query.orderDesc('$createdAt')];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, queries);
    const docs = res.documents as unknown as Tags[];
    all.push(...docs);
    if (docs.length < batch) break;
    cursor = (docs[docs.length - 1] as any).$id;
  }
  return { documents: all, total: all.length };
}

export async function listTagsByUser(userId: string) {
  return databases.listDocuments(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_TAGS,
    [Query.equal('userId', userId)]
  );
}
