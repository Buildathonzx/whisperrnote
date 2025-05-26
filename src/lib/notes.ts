import { databases, ID } from './appwrite';
import { Note, Notebook, ToDo, Sharing, Analytics } from '@/types/notes';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_NOTES_COLLECTION_ID!;
const NOTEBOOKS_COLLECTION_ID = process.env.NEXT_PUBLIC_NOTEBOOKS_COLLECTION_ID!;
const TODOS_COLLECTION_ID = process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!;
const SHARING_COLLECTION_ID = process.env.NEXT_PUBLIC_SHARING_COLLECTION_ID!;
const ANALYTICS_COLLECTION_ID = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;

// Note Operations
export async function createNote(note: Omit<Note, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      ID.unique(),
      {
        ...note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    
    // Track analytics
    await trackAnalytics(note.owner_id, doc.$id, 'note', 'create', {
      type: note.type,
      has_ai_metadata: Object.keys(note.ai_metadata).length > 0
    });
    
    return doc;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function getNote(noteId: string) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
    
    // Update view count
    await databases.updateDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      {
        'analytics.view_count': (doc.analytics?.view_count || 0) + 1,
        'analytics.last_accessed': new Date().toISOString()
      }
    );
    
    return doc;
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

    // Update edit count if content is being changed
    if (data.content) {
      updateData['analytics.edit_count'] = (data.analytics?.edit_count || 0) + 1;
    }

    const doc = await databases.updateDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      updateData
    );
    
    // Track analytics
    await trackAnalytics(doc.owner_id, noteId, 'note', 'edit', {
      fields_updated: Object.keys(data)
    });
    
    return doc;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(noteId: string) {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      { 
        is_deleted: true,
        updated_at: new Date().toISOString()
      }
    );
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

    return await databases.listDocuments(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      queries
    );
  } catch (error) {
    console.error('Error listing notes:', error);
    throw error;
  }
}

// Notebook Operations
export async function createNotebook(notebook: Omit<Notebook, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      NOTEBOOKS_COLLECTION_ID,
      ID.unique(),
      {
        ...notebook,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    
    await trackAnalytics(notebook.owner_id, doc.$id, 'notebook', 'create', {
      is_encrypted: notebook.is_encrypted
    });
    
    return doc;
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
}

export async function listNotebooks(userId: string) {
  try {
    return await databases.listDocuments(
      DATABASE_ID,
      NOTEBOOKS_COLLECTION_ID,
      [`owner_id=${userId}`]
    );
  } catch (error) {
    console.error('Error listing notebooks:', error);
    throw error;
  }
}

export async function updateNotebook(notebookId: string, data: Partial<Notebook>) {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      NOTEBOOKS_COLLECTION_ID,
      notebookId,
      {
        ...data,
        updated_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
}

export async function deleteNotebook(notebookId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, NOTEBOOKS_COLLECTION_ID, notebookId);
  } catch (error) {
    console.error('Error deleting notebook:', error);
    throw error;
  }
}

// ToDo Operations
export async function createToDo(todo: Omit<ToDo, '_id' | 'created_at' | 'updated_at'>) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      TODOS_COLLECTION_ID,
      ID.unique(),
      {
        ...todo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    
    await trackAnalytics(todo.owner_id, doc.$id, 'todo', 'create', {
      priority: todo.priority,
      has_due_date: !!todo.due_date
    });
    
    return doc;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

export async function updateToDo(todoId: string, data: Partial<ToDo>) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      TODOS_COLLECTION_ID,
      todoId,
      {
        ...data,
        updated_at: new Date().toISOString(),
      }
    );
    
    // Track completion analytics
    if (data.status === 'completed') {
      await trackAnalytics(doc.owner_id, todoId, 'todo', 'complete', {
        completion_time: new Date().toISOString()
      });
    }
    
    return doc;
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
    
    return await databases.listDocuments(
      DATABASE_ID,
      TODOS_COLLECTION_ID,
      queries
    );
  } catch (error) {
    console.error('Error listing todos:', error);
    throw error;
  }
}

export async function deleteToDo(todoId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, TODOS_COLLECTION_ID, todoId);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

// Sharing Operations
export async function shareResource(sharing: Omit<Sharing, '_id' | 'created_at'>) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      SHARING_COLLECTION_ID,
      ID.unique(),
      {
        ...sharing,
        created_at: new Date().toISOString(),
      }
    );
    
    // Update share count for the resource
    if (sharing.resource_type === 'note') {
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, sharing.resource_id);
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        sharing.resource_id,
        {
          'analytics.share_count': (note.analytics?.share_count || 0) + 1
        }
      );
    }
    
    await trackAnalytics(sharing.shared_by, sharing.resource_id, sharing.resource_type, 'share', {
      permission: sharing.permission,
      recipients_count: sharing.shared_with.length
    });
    
    return doc;
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
    
    return await databases.listDocuments(
      DATABASE_ID,
      SHARING_COLLECTION_ID,
      queries
    );
  } catch (error) {
    console.error('Error getting shared resources:', error);
    throw error;
  }
}

export async function revokeShare(shareId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, SHARING_COLLECTION_ID, shareId);
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
    return await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        resource_id: resourceId,
        resource_type: resourceType,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
        session_id: generateSessionId(),
        device_info: getDeviceInfo()
      }
    );
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw error for analytics to avoid disrupting main flow
  }
}

export async function getAnalytics(userId: string, resourceId?: string) {
  try {
    const queries = [`user_id=${userId}`];
    if (resourceId) {
      queries.push(`resource_id=${resourceId}`);
    }
    
    return await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTION_ID,
      queries
    );
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
      `timestamp>=${startDate.toISOString()}`,
      `timestamp<=${endDate.toISOString()}`
    ];
    
    return await databases.listDocuments(
      DATABASE_ID,
      ANALYTICS_COLLECTION_ID,
      queries
    );
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

// AI Operations
export async function generateAIMetadata(content: string) {
  try {
    // Mock AI metadata generation - replace with actual AI service
    const words = content.split(' ').length;
    const readingTime = Math.ceil(words / 200);
    
    return {
      summary: content.slice(0, 150) + (content.length > 150 ? '...' : ''),
      topics: extractTopics(content),
      sentiment: 'neutral',
      readingTime,
      keyPoints: extractKeyPoints(content),
      suggestions: generateSuggestions(content)
    };
  } catch (error) {
    console.error('Error generating AI metadata:', error);
    return {};
  }
}

// Helper Functions
function extractTopics(content: string): string[] {
  // Simple topic extraction - replace with actual AI
  const commonTopics = ['technology', 'business', 'science', 'education', 'health', 'finance'];
  const contentLower = content.toLowerCase();
  return commonTopics.filter(topic => contentLower.includes(topic));
}

function extractKeyPoints(content: string): string[] {
  // Simple key point extraction - replace with actual AI
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 3).map(s => s.trim());
}

function generateSuggestions(content: string): string[] {
  // Simple suggestions - replace with actual AI
  const suggestions = [];
  if (content.length < 100) {
    suggestions.push('Consider expanding this note with more details');
  }
  if (!content.includes('\n')) {
    suggestions.push('Break this into paragraphs for better readability');
  }
  return suggestions;
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  
  return {
    platform: navigator.platform,
    browser: navigator.userAgent.split(' ').pop() || 'Unknown',
    version: '1.0'
  };
}

// Client-side functions (for browser environment)
export async function createNoteClient(note: Omit<Note, '_id' | 'created_at' | 'updated_at'>) {
  // Implementation would use browser APIs for encrypted storage
  console.log('Creating note on client:', note);
}

export async function listNotesClient(userId: string, filters?: any) {
  // Implementation would retrieve from local storage or IndexedDB
  console.log('Listing notes on client for user:', userId);
  return [];
}
