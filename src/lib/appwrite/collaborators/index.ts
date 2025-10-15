import { tablesDB, ID, Query } from '../core/client';
import { APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_COLLABORATORS, APPWRITE_TABLE_ID_NOTES, APPWRITE_TABLE_ID_USERS } from '../core/client';
import type { Collaborators, Notes } from '@/types/appwrite';
import { getCurrentUser } from '../auth';

function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, id, ...cleanData } = data as any;
  return cleanData;
}

// Use shared metrics helper for collaborator counting
import { countNoteCollaborators } from '../usage/metrics';

// Create collaborator with duplicate guard and (optional) plan limit per note
export async function createCollaborator(data: Partial<Collaborators>) {
  if (!data || !(data as any).noteId) throw new Error('noteId required');
  if (!(data as any).userId) throw new Error('userId required');

  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) throw new Error('User not authenticated');

  const noteId = (data as any).noteId as string;
  const targetUserId = (data as any).userId as string;

  // Prevent sharing with self (owner or current user)
  if (targetUserId === currentUser.$id) throw new Error('Cannot share note with yourself');

  // Ownership check: ensure current user owns the note before adding collaborators
  try {
    const note = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_NOTES,
      rowId: noteId
    }) as unknown as Notes;
    if (note.userId !== currentUser.$id) throw new Error('Only note owner can add collaborators');
  } catch (e) {
    throw new Error('Unable to verify note ownership');
  }

  // Duplicate guard
  try {
    const existing = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_COLLABORATORS,
      queries: [
        Query.equal('noteId', noteId),
        Query.equal('userId', targetUserId),
        Query.limit(1)
      ] as any
    });
    if (existing.rows.length) {
      // Update permission if changed
      if ((data as any).permission && existing.rows[0].permission !== (data as any).permission) {
        try {
          await tablesDB.updateRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: APPWRITE_TABLE_ID_COLLABORATORS,
            rowId: existing.rows[0].$id,
            data: { permission: (data as any).permission }
          });
          (existing.rows[0] as any).permission = (data as any).permission;
        } catch {}
      }
      return existing.rows[0] as any;
    }
  } catch (e) {
    // Non-fatal duplicate guard failure
  }

  // Plan limit enforcement: collaborators per note (resource key: collaboratorsPerNote)
  try {
    const { enforcePlanLimit } = await import('../../subscriptions');
    const currentCount = await countNoteCollaborators(noteId);
    const check = await enforcePlanLimit(currentUser.$id, 'collaboratorsPerNote', currentCount);
    if (!check.allowed) {
      const err: any = new Error('Plan limit reached for collaborators on this note');
      err.code = 'PLAN_LIMIT_REACHED';
      err.resource = 'collaboratorsPerNote';
      err.limit = check.limit;
      err.plan = check.plan;
      throw err;
    }
  } catch (e: any) {
    if (e?.code === 'PLAN_LIMIT_REACHED') throw e; // propagate structured plan limit errors
  }

  const now = new Date().toISOString();
  const clean = cleanDocumentData<Collaborators>(data);
  const doc = await tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_COLLABORATORS,
    rowId: ID.unique(),
    data: {
      ...clean,
      invitedAt: clean.invitedAt || now,
      accepted: typeof (clean as any).accepted === 'boolean' ? (clean as any).accepted : true,
    }
  });
  return doc as unknown as Collaborators;
}

export async function getCollaborator(collaboratorId: string): Promise<Collaborators> {
  return tablesDB.getRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_COLLABORATORS,
    rowId: collaboratorId
  }) as Promise<Collaborators>;
}

export async function updateCollaborator(collaboratorId: string, data: Partial<Collaborators>) {
  const clean = cleanDocumentData<Collaborators>(data);
  return tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_COLLABORATORS,
    rowId: collaboratorId,
    data: clean
  });
}

export async function deleteCollaborator(collaboratorId: string) {
  return tablesDB.deleteRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_COLLABORATORS,
    rowId: collaboratorId
  });
}

export async function listCollaborators(noteId: string, limit: number = 100) {
  const queries = [Query.equal('noteId', noteId), Query.limit(limit)] as any;
  const res = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_COLLABORATORS,
    queries
  });
  return { ...res, documents: res.rows as unknown as Collaborators[] };
}

// List notes shared with current user (mirrors legacy getSharedNotes but modular)
export async function listSharedNotesForCurrentUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) return { documents: [], total: 0 };
  try {
    const collaborations = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_COLLABORATORS,
      queries: [Query.equal('userId', currentUser.$id), Query.limit(500)] as any
    });
    if (!collaborations.rows.length) return { documents: [], total: 0 };
    const notes: Notes[] = [];
    for (const collab of collaborations.rows as any[]) {
      try {
        const note = await tablesDB.getRow({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: APPWRITE_TABLE_ID_NOTES,
          rowId: collab.noteId
        }) as unknown as Notes;
        (note as any).sharedPermission = collab.permission;
        (note as any).sharedAt = collab.invitedAt;
        notes.push(note);
      } catch {}
    }
    return { documents: notes, total: notes.length };
  } catch {
    return { documents: [], total: 0 };
  }
}

// Fetch sharing metadata for a note and current user
export async function getNoteSharingForCurrentUser(noteId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) return null;
  try {
    const collabRes = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_COLLABORATORS,
      queries: [Query.equal('noteId', noteId), Query.equal('userId', currentUser.$id), Query.limit(1)] as any
    });
    if (!collabRes.rows.length) return null;
    return collabRes.rows[0];
  } catch {
    return null;
  }
}

// Remove sharing (owner action)
export async function removeNoteSharing(noteId: string, targetUserId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) throw new Error('User not authenticated');
  try {
    const note = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_NOTES,
      rowId: noteId
    }) as any;
    if (note.userId !== currentUser.$id) throw new Error('Only note owner can remove sharing');
    const collaborations = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_COLLABORATORS,
      queries: [Query.equal('noteId', noteId), Query.equal('userId', targetUserId), Query.limit(1)] as any
    });
    if (collaborations.rows.length) {
      await tablesDB.deleteRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: APPWRITE_TABLE_ID_COLLABORATORS,
        rowId: collaborations.rows[0].$id
      });
    }
    return { success: true };
  } catch (e: any) {
    throw new Error(e?.message || 'Failed to remove sharing');
  }
}

// Share a note with a user by email (owner action)
export async function shareNoteWithUser(noteId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') {
  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) throw new Error('User not authenticated');
  try {
    const note = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_NOTES,
      rowId: noteId
    }) as any;
    if (note.userId !== currentUser.$id) throw new Error('Only note owner can share notes');
    const users = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_USERS,
      queries: [Query.equal('email', email.toLowerCase()), Query.limit(1)] as any
    });
    if (!users.rows.length) throw new Error(`No user found with email: ${email}`);
    const targetUserId = users.rows[0].id || users.rows[0].$id;
    if (!targetUserId) throw new Error('Invalid user record');
    await createCollaborator({ noteId, userId: targetUserId, permission });
    return { success: true, message: `Note shared with ${email}` };
  } catch (e: any) {
    throw new Error(e?.message || 'Failed to share note');
  }
}

// Share by existing userId (owner action)
export async function shareNoteWithUserId(noteId: string, targetUserId: string, permission: 'read' | 'write' | 'admin' = 'read') {
  const currentUser = await getCurrentUser();
  if (!currentUser?.$id) throw new Error('User not authenticated');
  try {
    const note = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_NOTES,
      rowId: noteId
    }) as any;
    if (note.userId !== currentUser.$id) throw new Error('Only note owner can share notes');
    if (targetUserId === currentUser.$id) throw new Error('Cannot share a note with yourself');
    await createCollaborator({ noteId, userId: targetUserId, permission });
    return { success: true };
  } catch (e: any) {
    throw new Error(e?.message || 'Failed to share note');
  }
}
