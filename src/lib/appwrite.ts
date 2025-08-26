import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';
import type {
  Users,
  Notes,
  Tags,
  ApiKeys,
  BlogPosts,
  Comments,
  Extensions,
  Reactions,
  Collaborators,
  ActivityLog,
  Settings,
} from '../types/appwrite-types';

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
export const APPWRITE_COLLECTION_ID_BLOGPOSTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_BLOGPOSTS!;
export const APPWRITE_COLLECTION_ID_COMMENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COMMENTS!;
export const APPWRITE_COLLECTION_ID_EXTENSIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_EXTENSIONS!;
export const APPWRITE_COLLECTION_ID_REACTIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_REACTIONS!;
export const APPWRITE_COLLECTION_ID_COLLABORATORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COLLABORATORS!;
export const APPWRITE_COLLECTION_ID_ACTIVITYLOG = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_ACTIVITYLOG!;
export const APPWRITE_COLLECTION_ID_SETTINGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SETTINGS!;

export const APPWRITE_BUCKET_PROFILE_PICTURES = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_PICTURES!;
export const APPWRITE_BUCKET_NOTES_ATTACHMENTS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_NOTES_ATTACHMENTS!;
export const APPWRITE_BUCKET_BLOG_MEDIA = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BLOG_MEDIA!;
export const APPWRITE_BUCKET_EXTENSION_ASSETS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_EXTENSION_ASSETS!;
export const APPWRITE_BUCKET_BACKUPS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!;
export const APPWRITE_BUCKET_TEMP_UPLOADS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_UPLOADS!;

export { client, account, databases, storage, functions, ID, Query };

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

// --- USERS CRUD ---

// Helper function to clean document properties
function cleanDocumentData<T>(data: Partial<T>): Record<string, any> {
  const { $id, $sequence, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = data as any;
  return cleanData;
}

export async function createUser(data: Partial<Users>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_USERS, ID.unique(), cleanDocumentData(data));
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
  // Create note, set userId and id
  const cleanData = cleanDocumentData(data);
  const doc = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_ID_NOTES,
    ID.unique(),
    {
      ...cleanData,
      userId: user.$id,
      id: null // id will be set after creation
    }
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
  // Do not allow updating id or userId directly
  const { id, userId, ...rest } = data;
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId, rest) as Promise<Notes>;
}

export async function deleteNote(noteId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, noteId);
}

export async function listNotes(queries: any[] = []) {
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
  // Cast documents to Notes[]
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, queries);
  return { ...res, documents: res.documents as unknown as Notes[] };
}

// --- TAGS CRUD ---

export async function createTag(data: Partial<Tags>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, ID.unique(), cleanDocumentData(data));
}

export async function getTag(tagId: string): Promise<Tags> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId) as Promise<Tags>;
}

export async function updateTag(tagId: string, data: Partial<Tags>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId, cleanDocumentData(data));
}

export async function deleteTag(tagId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, tagId);
}

export async function listTags(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_TAGS, queries);
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

// --- BLOGPOSTS CRUD ---

export async function createBlogPost(data: Partial<BlogPosts>) {
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_BLOGPOSTS, ID.unique(), cleanDocumentData(data));
}

export async function getBlogPost(blogPostId: string): Promise<BlogPosts> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_BLOGPOSTS, blogPostId) as Promise<BlogPosts>;
}

export async function updateBlogPost(blogPostId: string, data: Partial<BlogPosts>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_BLOGPOSTS, blogPostId, cleanDocumentData(data));
}

export async function deleteBlogPost(blogPostId: string) {
  return databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_BLOGPOSTS, blogPostId);
}

export async function listBlogPosts(queries: any[] = []) {
  return databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_BLOGPOSTS, queries);
}

// --- COMMENTS CRUD ---

export async function createComment(noteId: string, content: string) {
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error("User not authenticated");
  const data = {
    noteId,
    content,
    userId: user.$id,
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
  return databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, ID.unique(), cleanDocumentData(data));
}

export async function getExtension(extensionId: string): Promise<Extensions> {
  return databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, extensionId) as Promise<Extensions>;
}

export async function updateExtension(extensionId: string, data: Partial<Extensions>) {
  return databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EXTENSIONS, extensionId, cleanDocumentData(data));
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
  APPWRITE_COLLECTION_ID_BLOGPOSTS,
  APPWRITE_COLLECTION_ID_COMMENTS,
  APPWRITE_COLLECTION_ID_EXTENSIONS,
  APPWRITE_COLLECTION_ID_REACTIONS,
  APPWRITE_COLLECTION_ID_COLLABORATORS,
  APPWRITE_COLLECTION_ID_ACTIVITYLOG,
  APPWRITE_COLLECTION_ID_SETTINGS,
  APPWRITE_BUCKET_PROFILE_PICTURES,
  APPWRITE_BUCKET_NOTES_ATTACHMENTS,
  APPWRITE_BUCKET_BLOG_MEDIA,
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
  createTag,
  getTag,
  updateTag,
  deleteTag,
  listTags,
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  listApiKeys,
  createBlogPost,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  listBlogPosts,
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
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
  uploadNoteAttachment,
  getNoteAttachment,
  deleteNoteAttachment,
};