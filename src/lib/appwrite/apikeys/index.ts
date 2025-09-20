import { databases, ID, Query } from '../core/client';
import { APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS } from '../core/client';
import type { ApiKeys } from '@/types/appwrite';
import { getCurrentUser } from '../auth';

// Clean Appwrite system fields from data before create/update
function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, id, userId, ...cleanData } = data as any;
  return cleanData;
}

// Create API key with plan limit enforcement and basic field initialization
export async function createApiKey(data: Partial<ApiKeys>) {
  const user = await getCurrentUser();
  if (!user?.$id) throw new Error('User not authenticated');

  // Plan limit check (apiKeys)
  try {
    const { enforcePlanLimit } = await import('../../subscriptions');
    const { countUserApiKeys } = await import('../usage/metrics');
    const currentCount = await countUserApiKeys(user.$id);
    const check = await enforcePlanLimit(user.$id, 'apiKeys', currentCount);
    if (!check.allowed) {
      const err: any = new Error('Plan limit reached for api keys');
      err.code = 'PLAN_LIMIT_REACHED';
      err.resource = 'apiKeys';
      err.limit = check.limit;
      err.plan = check.plan;
      throw err;
    }
  } catch (e: any) {
    if (e?.code === 'PLAN_LIMIT_REACHED') throw e; // propagate structured error
  }

  const now = new Date().toISOString();
  const clean = cleanDocumentData<ApiKeys>(data);
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_APIKEYS,
    ID.unique(),
    {
      ...clean,
      userId: user.$id,
      id: null,
      createdAt: now,
      lastUsed: null,
    }
  );
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_APIKEYS,
    doc.$id,
    { id: doc.$id }
  );
  return await getApiKey(doc.$id);
}

export async function getApiKey(apiKeyId: string): Promise<ApiKeys> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId) as Promise<ApiKeys>;
}

export async function updateApiKey(apiKeyId: string, data: Partial<ApiKeys>) {
  const clean = cleanDocumentData<ApiKeys>(data);
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId, clean);
}

export async function deleteApiKey(apiKeyId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId);
}

export async function listApiKeys(queries: any[] = [], limit: number = 100) {
  if (!queries.length) {
    const user = await getCurrentUser();
    if (!user?.$id) return { documents: [], total: 0 };
    queries = [Query.equal('userId', user.$id)];
  }
  const finalQueries = [...queries, Query.limit(limit), Query.orderDesc('$createdAt')];
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, finalQueries);
  return { ...res, documents: res.documents as unknown as ApiKeys[] };
}
