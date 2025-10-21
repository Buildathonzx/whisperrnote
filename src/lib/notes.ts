import { databases, ID } from './appwrite';
import { Note, Notebook, ToDo, Sharing, Analytics, AIMetadata } from '../types/notes';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTES_TABLE_ID = process.env.NEXT_PUBLIC_NOTES_TABLE_ID!;
const NOTEBOOKS_TABLE_ID = process.env.NEXT_PUBLIC_NOTEBOOKS_TABLE_ID!;
const TODOS_TABLE_ID = process.env.NEXT_PUBLIC_TODOS_TABLE_ID!;
const SHARING_TABLE_ID = process.env.NEXT_PUBLIC_SHARING_TABLE_ID!;
const ANALYTICS_TABLE_ID = process.env.NEXT_PUBLIC_ANALYTICS_TABLE_ID!;

// Helper function to safely cast Appwrite Document to our types
function castDocument<T>(doc: any): T {
  return doc as unknown as T;
}

function castDocuments<T>(docs: any[]): T[] {
  return docs as unknown as T[];
}

// Expiration helper
function isNoteExpired(note: any, now: number = Date.now()): boolean {
  if (!note) return false;
  if (!note.ephemeral) return false;
  if (!note.expiresAt) return false;
  const ts = Date.parse(note.expiresAt);
  if (Number.isNaN(ts)) return false;
  return ts <= now + 1500; // small grace window
}

// Note Operations
export async function createNote(note: Omit<Note, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const noteData = {
      ...note,
      format: note.format || 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      NOTES_TABLE_ID,
      ID.unique(),
      noteData as any
    );
    
    // Track analytics
    await trackAnalytics(note.owner_id, doc.$id, 'note', 'create', {});
    
    return castDocument<Note>(doc);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function getNote(noteId: string) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      NOTES_TABLE_ID,
      noteId
    );
    
    // Track view analytics
    await trackAnalytics(doc.owner_id, noteId, 'note', 'view', {});
    
    return castDocument<Note>(doc);
  } catch (error) {
    console.error('Error getting note:', error);
    throw error;
  }
}

export async function updateNote(noteId: string, data: Partial<Note>) {
  try {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.updateDocument(
      DATABASE_ID,
      NOTES_TABLE_ID,
      noteId,
      updateData as any
    );
    
    // Track edit analytics
    await trackAnalytics(doc.owner_id, noteId, 'note', 'edit', {});
    
    return castDocument<Note>(doc);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(noteId: string) {
  try {
    // Soft delete by marking as deleted
    await databases.updateDocument(
      DATABASE_ID,
      NOTES_TABLE_ID,
      noteId,
      { 
        is_deleted: true,
        updated_at: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

export async function listNotes(userId: string, filters?: {
  notebook_id?: string;
  tags?: string[];
  type?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
}) {
  try {
    const queries = [`owner_id=${userId}`, 'is_deleted=false'];
    
    if (filters?.notebook_id) {
      queries.push(`notebook_id=${filters.notebook_id}`);
    }
    if (filters?.type) {
      queries.push(`type=${filters.type}`);
    }
    if (filters?.is_archived !== undefined) {
      queries.push(`is_archived=${filters.is_archived}`);
    }
    if (filters?.is_pinned !== undefined) {
      queries.push(`is_pinned=${filters.is_pinned}`);
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTES_TABLE_ID,
      queries
    );
    
    return castDocuments<Note>(response.documents);
  } catch (error) {
    console.error('Error listing notes:', error);
    throw error;
  }
}

// Notebook Operations
export async function createNotebook(notebook: Omit<Notebook, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const notebookData = {
      ...notebook,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      NOTEBOOKS_TABLE_ID,
      ID.unique(),
      notebookData
    );
    
    return castDocument<Notebook>(doc);
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
}

export async function listNotebooks(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTEBOOKS_TABLE_ID,
      [`owner_id=${userId}`]
    );
    
    return castDocuments<Notebook>(response.documents);
  } catch (error) {
    console.error('Error listing notebooks:', error);
    throw error;
  }
}

export async function updateNotebook(notebookId: string, data: Partial<Notebook>) {
  try {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.updateDocument(
      DATABASE_ID,
      NOTEBOOKS_TABLE_ID,
      notebookId,
      updateData
    );
    
    return castDocument<Notebook>(doc);
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
}

export async function deleteNotebook(notebookId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      NOTEBOOKS_TABLE_ID,
      notebookId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting notebook:', error);
    throw error;
  }
}

// ToDo Operations
export async function createToDo(todo: Omit<ToDo, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const todoData = {
      ...todo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      TODOS_TABLE_ID,
      ID.unique(),
      todoData
    );
    
    return castDocument<ToDo>(doc);
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

export async function updateToDo(todoId: string, data: Partial<ToDo>) {
  try {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.updateDocument(
      DATABASE_ID,
      TODOS_TABLE_ID,
      todoId,
      updateData
    );
    
    return castDocument<ToDo>(doc);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

export async function listToDos(userId: string, status?: string) {
  try {
    const queries = [`owner_id=${userId}`];
    
    if (status) {
      queries.push(`status=${status}`);
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      TODOS_TABLE_ID,
      queries
    );
    
    return castDocuments<ToDo>(response.documents);
  } catch (error) {
    console.error('Error listing todos:', error);
    throw error;
  }
}

export async function deleteToDo(todoId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TODOS_TABLE_ID,
      todoId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

// Sharing Operations
export async function shareResource(sharing: Omit<Sharing, '_id' | 'created_at'>) {
  try {
    const shareData = {
      ...sharing,
      created_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      SHARING_TABLE_ID,
      ID.unique(),
      shareData
    );
    
    return castDocument<Sharing>(doc);
  } catch (error) {
    console.error('Error sharing resource:', error);
    throw error;
  }
}

export async function getSharedResources(userId: string, resourceType?: string) {
  try {
    const queries = [`shared_with=${userId}`];
    
    if (resourceType) {
      queries.push(`resource_type=${resourceType}`);
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      SHARING_TABLE_ID,
      queries
    );
    
    return castDocuments<Sharing>(response.documents);
  } catch (error) {
    console.error('Error getting shared resources:', error);
    throw error;
  }
}

export async function revokeShare(shareId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      SHARING_TABLE_ID,
      shareId
    );
    
    return true;
  } catch (error) {
    console.error('Error revoking share:', error);
    throw error;
  }
}

// Analytics Operations
export async function trackAnalytics(
  userId: string, 
  resourceId: string, 
  resourceType: string, 
  eventType: string, 
  eventData: Record<string, any>
) {
  try {
    const analyticsData = {
      user_id: userId,
      resource_id: resourceId,
      resource_type: resourceType,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_TABLE_ID,
      ID.unique(),
      analyticsData
    );
    
    return castDocument<Analytics>(doc);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw error for analytics failures
    return null;
  }
}

export async function getAnalytics(userId: string, resourceId?: string) {
  try {
    const queries = [`user_id=${userId}`];
    
    if (resourceId) {
      queries.push(`resource_id=${resourceId}`);
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_TABLE_ID,
      queries
    );
    
    return castDocuments<Analytics>(response.documents);
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
}

export async function getAnalyticsSummary(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
  try {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }
    
    const queries = [
      `user_id=${userId}`,
      `created_at>=${startDate.toISOString()}`,
      `created_at<=${endDate.toISOString()}`
    ];
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_TABLE_ID,
      queries
    );
    
    return castDocuments<Analytics>(response.documents);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

// AI Operations
export async function generateAIMetadata(content: string): Promise<AIMetadata> {
  try {
    // Mock AI processing - replace with actual AI service
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Simple keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const topics = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    return {
      summary: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      topics,
      readingTime,
      keyPoints: [content.split('.')[0] + '.'],
      sentiment: 'neutral'
    };
  } catch (error) {
    console.error('Error generating AI metadata:', error);
    return {
      readingTime: Math.ceil(content.split(' ').length / 200)
    };
  }
}

// Client-side helper functions
export async function createNoteClient(note: Omit<Note, '_id' | 'created_at' | 'updated_at'>) {
  const aiMetadata = await generateAIMetadata(note.content);
  
  return createNote({
    ...note,
    ai_metadata: aiMetadata,
    analytics: {
      view_count: 0,
      edit_count: 0,
      share_count: 0,
      last_accessed: new Date().toISOString()
    }
  });
}

export async function listNotesClient(userId: string, filters?: any) {
  const notes = await listNotes(userId, filters);
  
  // Sort by updated date, pinned first
  return notes.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
