import { Client, Account, Databases, Storage, Functions, ID, Query, Permission, Role } from 'appwrite';
import type {
  Users,
  Notes,
  Tags,
  ApiKeys,
  Comments,
  Extensions,
  Reactions,
  Collaborators,
  ActivityLog,
  Settings,
} from '../types/appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// export app public uri
export const APP_URI = process.env.NEXT_PUBLIC_APP_URI!;

// Appwrite config IDs from env
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const APPWRITE_COLLECTION_ID_USERS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS!;
export const APPWRITE_COLLECTION_ID_NOTES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_NOTES!;
export const APPWRITE_COLLECTION_ID_TAGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_TAGS!;
export const APPWRITE_COLLECTION_ID_APIKEYS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_APIKEYS!;
export const APPWRITE_COLLECTION_ID_COMMENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COMMENTS!;
export const APPWRITE_COLLECTION_ID_EXTENSIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_EXTENSIONS!;
export const APPWRITE_COLLECTION_ID_REACTIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_REACTIONS!;
export const APPWRITE_COLLECTION_ID_COLLABORATORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COLLABORATORS!;
export const APPWRITE_COLLECTION_ID_ACTIVITYLOG = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_ACTIVITYLOG!;
export const APPWRITE_COLLECTION_ID_SETTINGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SETTINGS!;

export const APPWRITE_BUCKET_PROFILE_PICTURES = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_PICTURES!;
export const APPWRITE_BUCKET_NOTES_ATTACHMENTS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_NOTES_ATTACHMENTS!;
export const APPWRITE_BUCKET_EXTENSION_ASSETS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_EXTENSION_ASSETS!;
export const APPWRITE_BUCKET_BACKUPS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!;
export const APPWRITE_BUCKET_TEMP_UPLOADS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_UPLOADS!;

export { client, account, databases, storage, functions, ID, Query, Permission, Role };

// --- AUTHENTICATION ---

export async function signupEmailPassword(email: string, password: string, name: string) {
  return account.create(ID.unique(), email, password, name);
}

export async function loginEmailPassword(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function logout() {
  return account.deleteSession('current');
}

export async function getCurrentUser(): Promise<Users | null> {
  try {
    return await account.get() as unknown as Users;
  } catch {
    return null;
  }
}

// --- EMAIL VERIFICATION ---

export async function sendEmailVerification(redirectUrl: string) {
  return account.createVerification(redirectUrl);
}

export async function completeEmailVerification(userId: string, secret: string) {
  return account.updateVerification(userId, secret);
}

export async function getEmailVerificationStatus(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user.emailVerification;
  } catch {
    return false;
  }
}

// --- PASSWORD RESET ---

export async function sendPasswordResetEmail(email: string, redirectUrl: string) {
  return account.createRecovery(email, redirectUrl);
}

export async function completePasswordReset(userId: string, secret: string, password: string) {
  return account.updateRecovery(userId, secret, password);
}

// --- USERS CRUD ---

// Helper function to clean document properties
function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = data as any;
  return cleanData;
}

export async function createUser(data: Partial<Users>) {
  const now = new Date().toISOString();
  const userData = {
    ...cleanDocumentData(data),
    createdAt: now,
    updatedAt: now
  };
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, ID.unique(), userData);
}

export async function getUser(userId: string): Promise<Users> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, userId) as Promise<Users>;
}

export async function updateUser(userId: string, data: Partial<Users>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, userId, cleanDocumentData(data));
}

export async function deleteUser(userId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, userId);
}

export async function listUsers(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, queries);
}

// --- NOTES CRUD ---

export async function createNote(data: Partial<Notes>) {
  // Get current user for userId
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  
  // Create note with proper timestamps
  const now = new Date().toISOString();
  const cleanData = cleanDocumentData(data);
  
  // Set initial permissions - private by default (only owner can access)
  const initialPermissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id))
  ];
  
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_NOTES,
    ID.unique(),
    {
      ...cleanData,
      userId: user.$id,
      id: null, // id will be set after creation
      createdAt: now,
      updatedAt: now
    },
    initialPermissions
  );
  
  // Patch the note to set id = $id (Appwrite does not set this automatically)
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_NOTES,
    doc.$id,
    { id: doc.$id }
  );
  
  // Return the updated document as Notes type
  return await getNote(doc.$id);
}

export async function getNote(noteId: string): Promise<Notes> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId) as unknown as Notes;
}

export async function updateNote(noteId: string, data: Partial<Notes>) {
  // Use cleanDocumentData to remove Appwrite system fields and id/userId
  const cleanData = cleanDocumentData(data);
  const { id, userId, ...rest } = cleanData;
  
  // Add updatedAt timestamp
  const updatedData = {
    ...rest,
    updatedAt: new Date().toISOString()
  };
  
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId, updatedData) as Promise<Notes>;
}

export async function deleteNote(noteId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId);
}

export async function listNotes(queries: any[] = [], limit: number = 100) {
  // By default, fetch all notes for the current user
  if (!queries.length) {
    const user = await getCurrentUser();
    if (!user || !user.$id) {
      // Return empty result instead of throwing error for unauthenticated users
      return { 
        documents: [], 
        total: 0 
      };
    }
    queries = [Query.equal("userId", user.$id)];
  }
  
  // Add limit and ordering
  const finalQueries = [
    ...queries,
    Query.limit(limit),
    Query.orderDesc("$createdAt") // Order by creation date, newest first
  ];
  
  // Cast documents to Notes[]
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, finalQueries);
  return { ...res, documents: res.documents as unknown as Notes[] };
}

// New function to get all notes with cursor pagination
export async function getAllNotes(): Promise<{ documents: Notes[], total: number }> {
  const user = await getCurrentUser();
  if (!user || !user.$id) {
    return { documents: [], total: 0 };
  }

  let allNotes: Notes[] = [];
  let cursor: string | undefined = undefined;
  const batchSize = 100; // Appwrite's max limit
  
  while (true) {
    const queries = [
      Query.equal("userId", user.$id),
      Query.limit(batchSize),
      Query.orderDesc("$createdAt")
    ];
    
    // Add cursor for pagination
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }
    
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, queries);
    const notes = res.documents as unknown as Notes[];
    
    allNotes = [...allNotes, ...notes];
    
    // If we got fewer results than requested, we've reached the end
    if (notes.length < batchSize) {
      break;
    }
    
    // Set cursor to the last document's ID for next batch
    cursor = notes[notes.length - 1].$id;
  }
  
  return {
    documents: allNotes,
    total: allNotes.length
  };
}

// --- TAGS CRUD ---

export async function createTag(data: Partial<Tags>) {
  // Get current user for userId
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  
  // Create tag with proper timestamps
  const now = new Date().toISOString();
  const cleanData = cleanDocumentData(data);
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_TAGS,
    ID.unique(),
    {
      ...cleanData,
      userId: user.$id,
      id: null, // id will be set after creation
      createdAt: now
    }
  );
  
  // Patch the tag to set id = $id (Appwrite does not set this automatically)
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_TAGS,
    doc.$id,
    { id: doc.$id }
  );
  
  // Return the updated document as Tags type
  return await getTag(doc.$id);
}

export async function getTag(tagId: string): Promise<Tags> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId) as Promise<Tags>;
}

export async function updateTag(tagId: string, data: Partial<Tags>) {
  // Do not allow updating id or userId directly
  const { id, userId, ...rest } = data;
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId, cleanDocumentData(rest));
}

export async function deleteTag(tagId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId);
}

export async function listTags(queries: any[] = [], limit: number = 100) {
  // By default, fetch all tags for the current user
  if (!queries.length) {
    const user = await getCurrentUser();
    if (!user || !user.$id) {
      // Return empty result instead of throwing error for unauthenticated users
      return { 
        documents: [], 
        total: 0 
      };
    }
    queries = [Query.equal("userId", user.$id)];
  }
  
  // Add limit and ordering
  const finalQueries = [
    ...queries,
    Query.limit(limit),
    Query.orderDesc("$createdAt")
  ];
  
  // Cast documents to Tags[]
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, finalQueries);
  return { ...res, documents: res.documents as unknown as Tags[] };
}

// New function to get all tags with cursor pagination
export async function getAllTags(): Promise<{ documents: Tags[], total: number }> {
  const user = await getCurrentUser();
  if (!user || !user.$id) {
    return { documents: [], total: 0 };
  }

  let allTags: Tags[] = [];
  let cursor: string | undefined = undefined;
  const batchSize = 100;
  
  while (true) {
    const queries = [
      Query.equal("userId", user.$id),
      Query.limit(batchSize),
      Query.orderDesc("$createdAt")
    ];
    
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }
    
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, queries);
    const tags = res.documents as unknown as Tags[];
    
    allTags = [...allTags, ...tags];
    
    if (tags.length < batchSize) {
      break;
    }
    
    cursor = tags[tags.length - 1].$id;
  }
  
  return {
    documents: allTags,
    total: allTags.length
  };
}

export async function listTagsByUser(userId: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, [Query.equal('userId', userId)]);
}

// --- APIKEYS CRUD ---

export async function createApiKey(data: Partial<ApiKeys>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, ID.unique(), cleanDocumentData(data));
}

export async function getApiKey(apiKeyId: string): Promise<ApiKeys> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId) as Promise<ApiKeys>;
}

export async function updateApiKey(apiKeyId: string, data: Partial<ApiKeys>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId, cleanDocumentData(data));
}

export async function deleteApiKey(apiKeyId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, apiKeyId);
}

export async function listApiKeys(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_APIKEYS, queries);
}

// --- COMMENTS CRUD ---

export async function createComment(noteId: string, content: string) {
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  const data = {
    noteId,
    content,
    userId: user.$id,
    createdAt: new Date().toISOString(),
  };
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COMMENTS, ID.unique(), data);
}

export async function getComment(commentId: string): Promise<Comments> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COMMENTS, commentId) as Promise<Comments>;
}

export async function updateComment(commentId: string, data: Partial<Comments>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COMMENTS, commentId, cleanDocumentData(data));
}

export async function deleteComment(commentId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COMMENTS, commentId);
}

export async function listComments(noteId: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COMMENTS, [Query.equal('noteId', noteId)]);
}

// --- EXTENSIONS CRUD ---

export async function createExtension(data: Partial<Extensions>) {
  // Get current user for authorId
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  
  // Create extension with proper timestamps
  const now = new Date().toISOString();
  const cleanData = cleanDocumentData(data);
  
  // Set initial permissions - private by default (only owner can access)
  const initialPermissions = [
    Permission.read(Role.user(user.$id)),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id))
  ];
  
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_EXTENSIONS,
    ID.unique(),
    {
      ...cleanData,
      authorId: user.$id,
      id: null, // id will be set after creation
      createdAt: now,
      updatedAt: now,
      isPublic: false // Default to private
    },
    initialPermissions
  );
  
  // Patch the extension to set id = $id (Appwrite does not set this automatically)
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_EXTENSIONS,
    doc.$id,
    { id: doc.$id }
  );
  
  // Return the updated document as Extensions type
  return await getExtension(doc.$id);
}

export async function getExtension(extensionId: string): Promise<Extensions> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, extensionId) as Promise<Extensions>;
}

export async function updateExtension(extensionId: string, data: Partial<Extensions>) {
  // Use cleanDocumentData to remove Appwrite system fields and id/authorId
  const cleanData = cleanDocumentData(data);
  const { id, authorId, ...rest } = cleanData;
  
  // Add updatedAt timestamp
  const updatedData = {
    ...rest,
    updatedAt: new Date().toISOString()
  };
  
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, extensionId, updatedData) as Promise<Extensions>;
}

export async function deleteExtension(extensionId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, extensionId);
}

export async function listExtensions(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, queries);
}

// --- REACTIONS CRUD ---

export async function createReaction(data: Partial<Reactions>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_REACTIONS, ID.unique(), cleanDocumentData(data));
}

export async function getReaction(reactionId: string): Promise<Reactions> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_REACTIONS, reactionId) as Promise<Reactions>;
}

export async function updateReaction(reactionId: string, data: Partial<Reactions>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_REACTIONS, reactionId, cleanDocumentData(data));
}

export async function deleteReaction(reactionId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_REACTIONS, reactionId);
}

export async function listReactions(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_REACTIONS, queries);
}

// --- COLLABORATORS CRUD ---

export async function createCollaborator(data: Partial<Collaborators>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COLLABORATORS, ID.unique(), cleanDocumentData(data));
}

export async function getCollaborator(collaboratorId: string): Promise<Collaborators> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COLLABORATORS, collaboratorId) as Promise<Collaborators>;
}

export async function updateCollaborator(collaboratorId: string, data: Partial<Collaborators>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COLLABORATORS, collaboratorId, cleanDocumentData(data));
}

export async function deleteCollaborator(collaboratorId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COLLABORATORS, collaboratorId);
}

export async function listCollaborators(noteId: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_COLLABORATORS, [Query.equal('noteId', noteId)]);
}

// --- ACTIVITY LOG CRUD ---

export async function createActivityLog(data: Partial<ActivityLog>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_ACTIVITYLOG, ID.unique(), cleanDocumentData(data));
}

export async function getActivityLog(activityLogId: string): Promise<ActivityLog> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_ACTIVITYLOG, activityLogId) as Promise<ActivityLog>;
}

export async function updateActivityLog(activityLogId: string, data: Partial<ActivityLog>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_ACTIVITYLOG, activityLogId, cleanDocumentData(data));
}

export async function deleteActivityLog(activityLogId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_ACTIVITYLOG, activityLogId);
}

export async function listActivityLogs() {
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_ACTIVITYLOG, [Query.equal('userId', user.$id)]);
}

// --- SETTINGS CRUD ---

export async function createSettings(data: Pick<Settings, 'userId' | 'settings'> & { mode?: string }) {
  if (!data.userId) throw new Error("userId is required to create settings");
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_SETTINGS, data.userId, data);
}

export async function getSettings(settingsId: string): Promise<Settings> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_SETTINGS, settingsId) as Promise<Settings>;
}

export async function updateSettings(settingsId: string, data: any) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_SETTINGS, settingsId, data);
}

export async function deleteSettings(settingsId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_SETTINGS, settingsId);
}

export async function listSettings(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_SETTINGS, queries);
}

// AI Mode specific functions
export async function updateAIMode(userId: string, mode: string) {
  try {
    await getSettings(userId);
    return await updateSettings(userId, { mode });
  } catch (error) {
    // If settings don't exist, create them with the AI mode
    return await createSettings({ 
      userId, 
      settings: JSON.stringify({ theme: 'light', notifications: true }),
      mode 
    });
  }
}

export async function getAIMode(userId: string): Promise<string | null> {
  try {
    const settings = await getSettings(userId);
    return (settings as any).mode || 'standard';
  } catch (error) {
    return 'standard'; // Default to standard mode
  }
}

// --- STORAGE/BUCKETS ---

export async function uploadFile(bucketId: string, file: File) {
  return storage.createFile(bucketId, ID.unique(), file);
}

export async function getFile(bucketId: string, fileId: string) {
  return storage.getFile(bucketId, fileId);
}

export async function deleteFile(bucketId: string, fileId: string) {
  return storage.deleteFile(bucketId, fileId);
}

export async function listFiles(bucketId: string, queries: any[] = []) {
  return storage.listFiles(bucketId, queries);
}

// --- UTILITY ---

export async function listDocuments(collectionId: string, queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, collectionId, queries);
}

export async function getDocument(collectionId: string, documentId: string) {
  return databases.getDocument(APPWRITE_DATABASE_ID, collectionId, documentId);
}

export async function updateDocument(collectionId: string, documentId: string, data: any) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, collectionId, documentId, data);
}

export async function deleteDocument(collectionId: string, documentId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, collectionId, documentId);
}

// --- ADVANCED/SEARCH ---

export async function searchNotesByTitle(title: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, [Query.search('title', title)]);
}

export async function searchNotesByTag(tagId: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, [Query.contains('tags', tagId)]);
}

export async function listNotesByUser(userId: string) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, [Query.equal('userId', userId)]);
}

export async function listPublicNotes() {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, [Query.equal('isPublic', true)]);
}

// --- PRIVATE SHARING ---

export async function shareNoteWithUser(noteId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    // First check if note exists and user owns it
    const note = await getNote(noteId);
    if (note.userId !== currentUser.$id) {
      throw new Error("Only note owner can share notes");
    }

    // Find user by email (check in Users collection)
    const usersList = await databases.listDocuments(
      APPWRITE_DATABASE_ID, 
      APPWRITE_COLLECTION_ID_USERS, 
      [Query.equal('email', email)]
    );

    let targetUserId: string;
    if (usersList.documents.length === 0) {
      throw new Error(`No user found with email: ${email}`);
    } else {
      const userId = usersList.documents[0].id || usersList.documents[0].$id;
      if (!userId) throw new Error(`Invalid user data for email: ${email}`);
      targetUserId = userId;
    }

    // Check if already shared
    const existingShares = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [
        Query.equal('noteId', noteId),
        Query.equal('userId', targetUserId)
      ]
    );

    if (existingShares.documents.length > 0) {
      // Update existing permission
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID_COLLABORATORS,
        existingShares.documents[0].$id,
        { permission }
      );
    } else {
      // Create new sharing record
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID_COLLABORATORS,
        ID.unique(),
        {
          noteId,
          userId: targetUserId,
          permission,
          invitedAt: new Date().toISOString(),
          accepted: true // Auto-accept for now
        }
      );
    }

    return { success: true, message: `Note shared with ${email}` };
  } catch (error: any) {
    console.error('shareNoteWithUser error:', error);
    throw new Error(error.message || 'Failed to share note');
  }
}

export async function getSharedUsers(noteId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    // Get all collaborations for this note
    const collaborations = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [Query.equal('noteId', noteId)]
    );

    // Get user details for each collaborator
    const sharedUsers = await Promise.all(
      collaborations.documents.map(async (collab: any) => {
        try {
          const user = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_USERS,
            collab.userId
          );
          return {
            id: collab.userId,
            email: user.email,
            permission: collab.permission,
            collaborationId: collab.$id
          };
        } catch (error) {
          console.error('Error fetching user details:', error);
          return null;
        }
      })
    );

    return sharedUsers.filter(user => user !== null);
  } catch (error: any) {
    console.error('getSharedUsers error:', error);
    throw new Error(error.message || 'Failed to get shared users');
  }
}

export async function removeNoteSharing(noteId: string, targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    // Check if user owns the note
    const note = await getNote(noteId);
    if (note.userId !== currentUser.$id) {
      throw new Error("Only note owner can remove sharing");
    }

    // Find and delete the collaboration record
    const collaborations = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [
        Query.equal('noteId', noteId),
        Query.equal('userId', targetUserId)
      ]
    );

    if (collaborations.documents.length > 0) {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID_COLLABORATORS,
        collaborations.documents[0].$id
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('removeNoteSharing error:', error);
    throw new Error(error.message || 'Failed to remove sharing');
  }
}

export async function getSharedNotes(): Promise<{ documents: Notes[], total: number }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { documents: [], total: 0 };

    // Get all collaborations where current user is a collaborator
    const collaborations = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [Query.equal('userId', currentUser.$id)]
    );

    // Get note details for each collaboration
    const sharedNotes = await Promise.all(
      collaborations.documents.map(async (collab: any): Promise<Notes | null> => {
        try {
          const note = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_NOTES,
            collab.noteId
          ) as unknown as Notes;
          
          // Add sharing info to note
          (note as any).sharedPermission = collab.permission;
          (note as any).sharedAt = collab.invitedAt;
          
          return note;
        } catch (error) {
          console.error('Error fetching shared note:', error);
          return null;
        }
      })
    );

    const validNotes = (sharedNotes.filter((n: Notes | null): n is Notes => n !== null));
    
    return {
      documents: validNotes,
      total: validNotes.length
    };
  } catch (error: any) {
    console.error('getSharedNotes error:', error);
    return { documents: [], total: 0 };
  }
}

export async function getNoteWithSharing(noteId: string): Promise<(Notes & { isSharedWithUser?: boolean, sharePermission?: string, sharedBy?: any }) | null> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const note = await getNote(noteId);
    
    // Check if note is shared with current user
    const collaboration = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_COLLABORATORS,
      [
        Query.equal('noteId', noteId),
        Query.equal('userId', currentUser.$id)
      ]
    );

    let sharedBy = null;
    if (collaboration.documents.length > 0 && note.userId && note.userId !== currentUser.$id) {
      // Get details about who shared this note
      try {
        sharedBy = await databases.getDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ID_USERS,
          note.userId
        );
      } catch (error) {
        console.error('Error fetching note owner details:', error);
      }
    }

    return {
      ...note,
      isSharedWithUser: collaboration.documents.length > 0,
      sharePermission: collaboration.documents.length > 0 ? collaboration.documents[0].permission : undefined,
      sharedBy: sharedBy ? { name: sharedBy.name, email: sharedBy.email } : null
    };
  } catch (error) {
    console.error('getNoteWithSharing error:', error);
    return null;
  }
}

export async function getPublicNote(noteId: string): Promise<Notes | null> {
  try {
    const note = await databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId) as unknown as Notes;
    
    // Only return note if it's public
    if (note.isPublic) {
      return note;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// --- PROFILE PICTURE HELPERS ---

export async function uploadProfilePicture(file: File) {
  return uploadFile(APPWRITE_BUCKET_PROFILE_PICTURES, file);
}

export async function getProfilePicture(fileId: string) {
  return storage.getFileView(APPWRITE_BUCKET_PROFILE_PICTURES, fileId);
}

export async function deleteProfilePicture(fileId: string) {
  return deleteFile(APPWRITE_BUCKET_PROFILE_PICTURES, fileId);
}

// --- NOTES ATTACHMENTS HELPERS ---

export async function uploadNoteAttachment(file: File) {
  return uploadFile(APPWRITE_BUCKET_NOTES_ATTACHMENTS, file);
}

export async function getNoteAttachment(fileId: string) {
  return getFile(APPWRITE_BUCKET_NOTES_ATTACHMENTS, fileId);
}

export async function deleteNoteAttachment(fileId: string) {
  return deleteFile(APPWRITE_BUCKET_NOTES_ATTACHMENTS, fileId);
}

// ...add similar helpers for other buckets as needed...

// --- EXPORT DEFAULTS ---
export default {
  client,
  account,
  databases,
  storage,
  // IDs
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID_USERS,
  APPWRITE_COLLECTION_ID_NOTES,
  APPWRITE_COLLECTION_ID_TAGS,
  APPWRITE_COLLECTION_ID_APIKEYS,
  APPWRITE_COLLECTION_ID_COMMENTS,
  APPWRITE_COLLECTION_ID_EXTENSIONS,
  APPWRITE_COLLECTION_ID_REACTIONS,
  APPWRITE_COLLECTION_ID_COLLABORATORS,
  APPWRITE_COLLECTION_ID_ACTIVITYLOG,
  APPWRITE_COLLECTION_ID_SETTINGS,
  APPWRITE_BUCKET_PROFILE_PICTURES,
  APPWRITE_BUCKET_NOTES_ATTACHMENTS,
  APPWRITE_BUCKET_EXTENSION_ASSETS,
  APPWRITE_BUCKET_BACKUPS,
  APPWRITE_BUCKET_TEMP_UPLOADS,
  // Methods
  signupEmailPassword,
  loginEmailPassword,
  logout,
  getCurrentUser,
  sendEmailVerification,
  completeEmailVerification,
  getEmailVerificationStatus,
  sendPasswordResetEmail,
  completePasswordReset,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  listUsers,
  createNote,
  getNote,
  updateNote,
  deleteNote,
  listNotes,
  getAllNotes,
  createTag,
  getTag,
  updateTag,
  deleteTag,
  listTags,
  getAllTags,
  listTagsByUser,
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  listApiKeys,
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listComments,
  createExtension,
  getExtension,
  updateExtension,
  deleteExtension,
  listExtensions,
  createReaction,
  getReaction,
  updateReaction,
  deleteReaction,
  listReactions,
  createCollaborator,
  getCollaborator,
  updateCollaborator,
  deleteCollaborator,
  listCollaborators,
  createActivityLog,
  getActivityLog,
  updateActivityLog,
  deleteActivityLog,
  listActivityLogs,
  createSettings,
  getSettings,
  updateSettings,
  deleteSettings,
  listSettings,
  updateAIMode,
  getAIMode,
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  searchNotesByTitle,
  searchNotesByTag,
  listNotesByUser,
  listPublicNotes,
  getPublicNote,
  shareNoteWithUser,
  getSharedUsers,
  removeNoteSharing,
  getSharedNotes,
  getNoteWithSharing,
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
  uploadNoteAttachment,
  getNoteAttachment,
  deleteNoteAttachment,
};