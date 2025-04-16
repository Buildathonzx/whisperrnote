import { databases, ID } from './appwrite';

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const notesCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!;

export interface Note {
  id?: string; // Appwrite schema uses 'id'
  $id?: string; // Appwrite document reference
  title: string;
  content: string;
  userId: string;
  isPublic: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function createNote(note: Omit<Note, 'id' | '$id' | 'createdAt' | 'updatedAt'>) {
  // Appwrite will auto-generate id, createdAt, updatedAt
  return databases.createDocument(databaseId, notesCollectionId, ID.unique(), note);
}

export async function getNote(noteId: string) {
  return databases.getDocument(databaseId, notesCollectionId, noteId);
}

export async function updateNote(noteId: string, data: Partial<Note>) {
  return databases.updateDocument(databaseId, notesCollectionId, noteId, data);
}

export async function deleteNote(noteId: string) {
  return databases.deleteDocument(databaseId, notesCollectionId, noteId);
}

export async function listNotes(userId: string) {
  // Only return notes for the given user
  // Query.equal is available from 'appwrite' as Query
  // To avoid import issues, use string query
  return databases.listDocuments(databaseId, notesCollectionId, [
    // @ts-ignore
    { attribute: 'userId', operator: 'equal', value: [userId] }
  ]);
}
