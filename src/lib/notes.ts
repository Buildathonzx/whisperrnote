import { databases, ID } from './appwrite';
import { Note, Notebook, ToDo, Sharing, Analytics, AIMetadata } from '../types/notes';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_NOTES_COLLECTION_ID!;
const NOTEBOOKS_COLLECTION_ID = process.env.NEXT_PUBLIC_NOTEBOOKS_COLLECTION_ID!;
const TODOS_COLLECTION_ID = process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!;
const SHARING_COLLECTION_ID = process.env.NEXT_PUBLIC_SHARING_COLLECTION_ID!;
const ANALYTICS_COLLECTION_ID = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;

// Helper function to safely cast Appwrite Document to our types
function castDocument<T>(doc: any): T {
  return doc as unknown as T;
}

function castDocuments<T>(docs: any[]): T[] {
  return docs as unknown as T[];
}

// Note Operations
export async function createNote(note: Omit<Note, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const noteData = {
      ...note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const doc = await databases.createDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      ID.unique(),
      noteData
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
      NOTES_COLLECTION_ID,
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
      NOTES_COLLECTION_ID,
      noteId,
      updateData
    );
    
    // Track edit analytics
    await trackAnalytics(doc.owner_id, noteId, 'note', 'edit', {});
    
    return doc as Note;
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
      NOTES_COLLECTION_ID,
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
      NOTES_COLLECTION_ID,
      queries
    );
    
    return response.documents as Note[];
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
      NOTEBOOKS_COLLECTION_ID,
      ID.unique(),
      notebookData
    );
    
    return doc as Notebook;
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
}

export async function listNotebooks(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTEBOOKS_COLLECTION_ID,
      [`owner_id=${userId}`]
    );
    
    return response.documents as Notebook[];
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
      NOTEBOOKS_COLLECTION_ID,
      notebookId,
      updateData
    );
    
    return doc as Notebook;
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
}

export async function deleteNotebook(notebookId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      NOTEBOOKS_COLLECTION_ID,
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
      TODOS_COLLECTION_ID,
      ID.unique(),
      todoData
    );
    
    return doc as ToDo;
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
      TODOS_COLLECTION_ID,
      todoId,
      updateData
    );
    
    return doc as ToDo;
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
      TODOS_COLLECTION_ID,
      queries
    );
    
    return response.documents as ToDo[];
  } catch (error) {
    console.error('Error listing todos:', error);
    throw error;
  }
}

export async function deleteToDo(todoId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TODOS_COLLECTION_ID,
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
      SHARING_COLLECTION_ID,
      ID.unique(),
      shareData
    );
    
    return doc as Sharing;
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
      SHARING_COLLECTION_ID,
      queries
    );
    
    return response.documents as Sharing[];
  } catch (error) {
    console.error('Error getting shared resources:', error);
    throw error;
  }
}

export async function revokeShare(shareId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      SHARING_COLLECTION_ID,
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
      ANALYTICS_COLLECTION_ID,
      ID.unique(),
      analyticsData
    );
    
    return doc as Analytics;
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
      ANALYTICS_COLLECTION_ID,
      queries
    );
    
    return response.documents as Analytics[];
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
      ANALYTICS_COLLECTION_ID,
      queries
    );
    
    return response.documents as Analytics[];
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
