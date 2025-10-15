// This file will contain all user-profile related functions
import { tablesDB, ID, Query } from '../appwrite';
import { APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_USERS } from '../appwrite';
import type { Users } from '@/types/appwrite';

// Helper function to clean document properties
function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = data as any;
  return cleanData;
}

export async function createUser(data: Partial<Users>) {
  const now = new Date().toISOString();
  const userData = {
    ...cleanDocumentData(data),
    createdAt: now,
    updatedAt: now
  };
  return tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_USERS,
    rowId: data.id || ID.unique(),
    data: userData
  });
}

export async function getUser(userId: string): Promise<Users> {
  return tablesDB.getRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_USERS,
    rowId: userId
  }) as Promise<Users>;
}

export async function updateUser(userId: string, data: Partial<Users>) {
  return tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_USERS,
    rowId: userId,
    data: cleanDocumentData(data)
  });
}

export async function deleteUser(userId: string) {
  return tablesDB.deleteRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_USERS,
    rowId: userId
  });
}

export async function listUsers(queries: any[] = []) {
  const res = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_USERS,
    queries
  });
  return { ...res, documents: res.rows };
}

// Search users by partial name or email with privacy constraints
export async function searchUsers(query: string, limit: number = 5) {
  try {
    if (!query.trim()) return [];

    const isEmail = /@/.test(query) && /\./.test(query);

    const queries: any[] = [Query.limit(limit)];

    if (isEmail) {
      // Exact email match only (do not expose partial email enumeration)
      queries.push(Query.equal('email', query.toLowerCase()));
    } else {
      // Name search using Query.search for case-insensitive partial matching
      queries.push(Query.search('name', query));
      // Only include users who have explicitly made their profile public (top-level field)
      queries.push(Query.equal('publicProfile', true));
    }

    const res = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_USERS,
      queries
    });

    return res.rows.map((doc: any) => ({
      id: doc.id || doc.$id,
      name: doc.name,
      // Only include email if user searched by email (explicit) to reduce leakage
      email: isEmail ? doc.email : undefined,
      // Prefer top-level profilePicId, then legacy prefs.profilePicId, then avatar
      avatar: doc.profilePicId || (doc.prefs && (doc.prefs as any).profilePicId) || doc.avatar || null
    }));
  } catch (error) {
    console.error('searchUsers error:', error);
    return [];
  }
}
