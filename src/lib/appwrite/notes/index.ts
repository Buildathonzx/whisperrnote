import { tablesDB, ID, Query, Permission, Role } from '../core/client';
import { APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_NOTES, APPWRITE_TABLE_ID_TAGS } from '../core/client';
import type { Notes } from '@/types/appwrite';
import { getCurrentUser } from '../auth';
import { adjustTagUsage } from '../tags';

// Lazy imports inside functions to avoid circular dependency during gradual refactor

function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = data as any;
  return cleanData;
}

// Whitelist of valid columns for notes table (based on appwrite.config.json)
const VALID_NOTE_COLUMNS = [
  'id', 'createdAt', 'updatedAt', 'userId', 'isPublic', 'status', 
  'parentNoteId', 'title', 'content', 'tags', 'comments', 
  'extensions', 'collaborators', 'metadata'
];

function filterNoteData(data: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const key of VALID_NOTE_COLUMNS) {
    if (key in data) {
      filtered[key] = data[key];
    }
  }
  return filtered;
}



export async function createNote(data: Partial<Notes>) {
  const user = await getCurrentUser();
  if (!user?.$id) throw new Error('User not authenticated');

  // Plan limit check
  try {
    const { enforcePlanLimit } = await import('../../subscriptions');
    const { countUserNotes } = await import('../usage/metrics');
    const currentCount = await countUserNotes(user.$id);
    const check = await enforcePlanLimit(user.$id, 'notes', currentCount);
    if (!check.allowed) {
      const err: any = new Error('Plan limit reached for notes');
      err.code = 'PLAN_LIMIT_REACHED';
      err.resource = 'notes';
      err.limit = check.limit;
      err.plan = check.plan;
      throw err;
    }
  } catch (e: any) {
    if (e?.code === 'PLAN_LIMIT_REACHED') throw e; // propagate structured error
  }

  const now = new Date().toISOString();
  const cleanData = cleanDocumentData(data);
  const filteredData = filterNoteData(cleanData);
  const initialPermissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id))
  ];
  const doc = await tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: ID.unique(),
    data: {
      ...filteredData,
      userId: user.$id,
      id: null,
      createdAt: now,
      updatedAt: now
    },
    permissions: initialPermissions
  });
  await tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: doc.$id,
    data: { id: doc.$id }
  });

  // Tag dual-write
  try {
    const noteTagsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTETAGS || 'note_tags';
    const rawTags: string[] = Array.isArray((data as any).tags) ? (data as any).tags.filter(Boolean) : [];
    if (rawTags.length) {
      const unique = Array.from(new Set(rawTags.map(t => t.trim()))).filter(Boolean);
      if (unique.length) {
        let existingTagDocs: Record<string, any> = {};
        try {
          const existingTagsRes = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: APPWRITE_TABLE_ID_TAGS,
            queries: [Query.equal('userId', user.$id), Query.equal('nameLower', unique.map(t => t.toLowerCase())), Query.limit(unique.length)] as any
          });
          for (const td of existingTagsRes.rows as any[]) {
            if (td.nameLower) existingTagDocs[td.nameLower] = td;
          }
        } catch {}
        for (const tagName of unique) {
          const key = tagName.toLowerCase();
          if (!existingTagDocs[key]) {
            try {
              const created = await tablesDB.createRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: APPWRITE_TABLE_ID_TAGS,
                rowId: ID.unique(),
                data: { name: tagName, nameLower: key, userId: user.$id, createdAt: now, usageCount: 0 }
              });
              existingTagDocs[key] = created;
            } catch {
              try {
                const retry = await tablesDB.listRows({
                  databaseId: APPWRITE_DATABASE_ID,
                  tableId: APPWRITE_TABLE_ID_TAGS,
                  queries: [Query.equal('userId', user.$id), Query.equal('nameLower', key), Query.limit(1)] as any
                });
                if (retry.rows.length) existingTagDocs[key] = retry.rows[0];
              } catch {}
            }
          }
        }
        const existingPivot = await tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: noteTagsCollection,
          queries: [Query.equal('noteId', doc.$id), Query.limit(500)] as any
        });
        const existingPairs = new Set(existingPivot.rows.map((p: any) => `${p.tagId || ''}::${p.tag || ''}`));
        for (const tagName of unique) {
          const key = tagName.toLowerCase();
          const tagDoc = existingTagDocs[key];
            const tagId = tagDoc ? (tagDoc.$id || tagDoc.id) : undefined;
          if (!tagId) continue;
          const pairKey = `${tagId}::${tagName}`;
          adjustTagUsage(user.$id, tagName, 1);
          if (existingPairs.has(pairKey)) continue;
          try {
            await tablesDB.createRow({
              databaseId: APPWRITE_DATABASE_ID,
              tableId: noteTagsCollection,
              rowId: ID.unique(),
              data: { noteId: doc.$id, tagId, tag: tagName, userId: user.$id, createdAt: now }
            });
          } catch {}
        }
      }
    }
  } catch {}

  return await getNote(doc.$id);
}

export async function getNote(noteId: string): Promise<Notes> {
  const doc = await tablesDB.getRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: noteId
  }) as any;
  try {
    const noteTagsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTETAGS || 'note_tags';
    const pivot = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: noteTagsCollection,
      queries: [Query.equal('noteId', noteId), Query.limit(200)] as any
    });
    if (pivot.rows.length) {
      const tags = Array.from(new Set(pivot.rows.map((p: any) => p.tag).filter(Boolean)));
      (doc as any).tags = tags;
    }
  } catch {}
  return doc as Notes;
}

export async function updateNote(noteId: string, data: Partial<Notes>) {
  const cleanData = cleanDocumentData(data);
  const filteredData = filterNoteData(cleanData);
  const { id, userId, ...rest } = filteredData;
  const updatedAt = new Date().toISOString();
  const updatedData = { ...rest, updatedAt };
  const before = await tablesDB.getRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: noteId
  }) as any;
  const doc = await tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: noteId,
    data: updatedData
  }) as any;

  // Revisions logging
  try {
    const revisionsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTEREVISIONS || 'note_revisions';
    const significantFields = ['title', 'content', 'tags'];
    let changed = false;
    const changes: Record<string, { before: any; after: any }> = {};
    for (const f of significantFields) {
      if (f in (data as any)) {
        const prevVal = before[f];
        const newVal = (data as any)[f];
        const prevSerialized = JSON.stringify(prevVal ?? null);
        const newSerialized = JSON.stringify(newVal ?? null);
        if (prevSerialized !== newSerialized) {
          changed = true;
          changes[f] = { before: prevVal ?? null, after: newVal ?? null };
        }
      }
    }
    if (changed) {
      let revisionNumber = 1;
      try {
        const existing = await tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: revisionsCollection,
          queries: [Query.equal('noteId', noteId), Query.orderDesc('revision'), Query.limit(1)] as any
        });
        if (existing.rows.length) {
          revisionNumber = (existing.rows[0] as any).revision + 1;
        }
      } catch {}
      let diffObj = { changes } as any;
      let diffStr = '';
      try { diffStr = JSON.stringify(diffObj).slice(0, 7900); } catch { diffStr = ''; }
      await tablesDB.createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: revisionsCollection,
        rowId: ID.unique(),
        data: {
          noteId,
          revision: revisionNumber,
          userId: before.userId || null,
          createdAt: updatedAt,
          title: doc.title,
          content: doc.content,
          diff: diffStr || null,
          diffFormat: diffStr ? 'json' : null,
          fullSnapshot: true,
          cause: 'manual'
        }
      });
    }
  } catch {}

  // Tags update & pivot sync
  try {
    if (Array.isArray((data as any).tags)) {
      const noteTagsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTETAGS || 'note_tags';
      const incomingRaw: string[] = (data as any).tags.filter(Boolean).map((t: string) => t.trim());
      const normalizedIncoming = Array.from(new Set(incomingRaw)).filter(Boolean);
      const incomingSet = new Set(normalizedIncoming);
      const currentUser = await getCurrentUser();
      const tagDocs: Record<string, any> = {};
      if (normalizedIncoming.length && currentUser?.$id) {
        try {
          const existingTagsRes = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: APPWRITE_TABLE_ID_TAGS,
            queries: [Query.equal('userId', currentUser.$id), Query.equal('nameLower', normalizedIncoming.map(t => t.toLowerCase())), Query.limit(normalizedIncoming.length)] as any
          });
          for (const td of existingTagsRes.rows as any[]) {
            if (td.nameLower) tagDocs[td.nameLower] = td;
          }
        } catch {}
        for (const tagName of normalizedIncoming) {
          const key = tagName.toLowerCase();
          if (!tagDocs[key]) {
            try {
              const created = await tablesDB.createRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: APPWRITE_TABLE_ID_TAGS,
                rowId: ID.unique(),
                data: { name: tagName, nameLower: key, userId: currentUser?.$id, createdAt: updatedAt, usageCount: 0 }
              });
              tagDocs[key] = created;
            } catch {
              try {
                const retry = await tablesDB.listRows({
                  databaseId: APPWRITE_DATABASE_ID,
                  tableId: APPWRITE_TABLE_ID_TAGS,
                  queries: [Query.equal('userId', currentUser?.$id), Query.equal('nameLower', key), Query.limit(1)] as any
                });
                if (retry.rows.length) tagDocs[key] = retry.rows[0];
              } catch {}
            }
          }
        }
      }
      const existingPivot = await tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: noteTagsCollection,
        queries: [Query.equal('noteId', noteId), Query.limit(500)] as any
      });
      const existingByTag: Record<string, any> = {};
      const existingPairs = new Set<string>();
      for (const p of existingPivot.rows as any[]) {
        if (p.tag) existingByTag[p.tag] = p;
        if (p.tagId && p.tag) existingPairs.add(`${p.tagId}::${p.tag}`);
      }
      for (const p of existingPivot.rows as any[]) {
        if (!p.tagId && p.tag) {
          const key = p.tag.toLowerCase();
          const tagDoc = tagDocs[key];
          if (tagDoc) {
            try {
              await tablesDB.updateRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: noteTagsCollection,
                rowId: p.$id,
                data: { tagId: tagDoc.$id || tagDoc.id }
              });
              existingPairs.add(`${tagDoc.$id || tagDoc.id}::${p.tag}`);
            } catch {}
          }
        }
      }
      for (const tagName of normalizedIncoming) {
        const key = tagName.toLowerCase();
        const tagDoc = tagDocs[key];
        const tagId = tagDoc ? (tagDoc.$id || tagDoc.id) : undefined;
        if (!tagId) continue;
        const pairKey = `${tagId}::${tagName}`;
        if (existingPairs.has(pairKey)) continue;
        adjustTagUsage(currentUser?.$id, tagName, 1);
        try {
          await tablesDB.createRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: noteTagsCollection,
            rowId: ID.unique(),
            data: { noteId, tagId, tag: tagName, userId: currentUser?.$id || null, createdAt: updatedAt }
          });
          existingPairs.add(pairKey);
        } catch {}
      }
      for (const [tagName, pivotDoc] of Object.entries(existingByTag)) {
        if (!incomingSet.has(tagName)) {
          adjustTagUsage(currentUser?.$id, tagName, -1);
          try {
            await tablesDB.deleteRow({
              databaseId: APPWRITE_DATABASE_ID,
              tableId: noteTagsCollection,
              rowId: (pivotDoc as any).$id
            });
          } catch {}
        }
      }
    }
  } catch {}
  return doc as Notes;
}

export async function deleteNote(noteId: string) {
  return tablesDB.deleteRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    rowId: noteId
  });
}

export async function listNotes(queries: any[] = [], limit: number = 100) {
  if (!queries.length) {
    const user = await getCurrentUser();
    if (!user?.$id) {
      return { documents: [], total: 0 };
    }
    queries = [Query.equal('userId', user.$id)];
  }
  const finalQueries = [...queries, Query.limit(limit), Query.orderDesc('$createdAt')];
  const res = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: APPWRITE_TABLE_ID_NOTES,
    queries: finalQueries
  });
  const notes = res.rows as unknown as Notes[];
  try {
    if (notes.length) {
      const noteTagsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTETAGS || 'note_tags';
      const noteIds = notes.map((n: any) => n.$id || (n as any).id).filter(Boolean);
      if (noteIds.length) {
        const pivotRes = await tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: noteTagsCollection,
          queries: [Query.equal('noteId', noteIds), Query.limit(Math.min(1000, noteIds.length * 10))] as any
        });
        const tagMap: Record<string, Set<string>> = {};
        for (const p of pivotRes.rows as any[]) {
          if (!p.noteId || !p.tag) continue;
          if (!tagMap[p.noteId]) tagMap[p.noteId] = new Set();
          tagMap[p.noteId].add(p.tag);
        }
        for (const n of notes as any[]) {
          const id = n.$id || n.id;
          if (id && tagMap[id] && tagMap[id].size) {
            n.tags = Array.from(tagMap[id]);
          }
        }
      }
    }
  } catch {}
  return { ...res, documents: notes, total: res.total };
}

export async function getAllNotes(): Promise<{ documents: Notes[]; total: number }> {
  const user = await getCurrentUser();
  if (!user?.$id) return { documents: [], total: 0 };
  let allNotes: Notes[] = [];
  let cursor: string | undefined;
  const batchSize = 100;
  while (true) {
    const queries: any[] = [Query.equal('userId', user.$id), Query.limit(batchSize), Query.orderDesc('$createdAt')];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_NOTES,
      queries
    });
    const batch = res.rows as unknown as Notes[];
    allNotes.push(...batch);
    if (batch.length < batchSize) break;
    cursor = (batch[batch.length - 1] as any).$id;
  }
  try {
    if (allNotes.length) {
      const noteTagsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTETAGS || 'note_tags';
      const noteIds = allNotes.map((n: any) => n.$id || (n as any).id).filter(Boolean);
      const chunk = <T,>(arr: T[], size: number): T[][] => arr.length ? [arr.slice(0, size), ...chunk(arr.slice(size), size)] : [];
      const idChunks = chunk(noteIds, 100);
      const tagMap: Record<string, Set<string>> = {};
      for (const ids of idChunks) {
        const pivotRes = await tablesDB.listRows({
          databaseId: APPWRITE_DATABASE_ID,
          tableId: noteTagsCollection,
          queries: [Query.equal('noteId', ids), Query.limit(Math.min(1000, ids.length * 10))] as any
        });
        for (const p of pivotRes.rows as any[]) {
          if (!p.noteId || !p.tag) continue;
          if (!tagMap[p.noteId]) tagMap[p.noteId] = new Set();
          tagMap[p.noteId].add(p.tag);
        }
      }
      for (const n of allNotes as any[]) {
        const id = n.$id || n.id;
        if (id && tagMap[id] && tagMap[id].size) {
          n.tags = Array.from(tagMap[id]);
        }
      }
    }
  } catch {}
  return { documents: allNotes, total: allNotes.length };
}

export async function listNoteRevisions(noteId: string, limit: number = 50) {
  try {
    const revisionsCollection = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID_NOTEREVISIONS || 'note_revisions';
    const res = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: revisionsCollection,
      queries: [Query.equal('noteId', noteId), Query.orderDesc('revision'), Query.limit(limit)] as any
    });
    return { documents: res.rows, total: res.total } as any;
  } catch {
    return { documents: [], total: 0 } as any;
  }
}
