/**
 * Permissions utilities for managing note access control
 * Handles public/private notes and sharing functionality
 */

import { Permission, Role } from 'appwrite';
import { getCurrentUser, databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES } from '../appwrite';
import type { Notes } from '@/types/appwrite-types';

/**
 * Permission levels for notes
 */
export enum NotePermission {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared'
}

/**
 * Check if a note is publicly accessible
 */
export function isNotePublic(note: Notes): boolean {
  return note.isPublic === true;
}

/**
 * Check if current user owns a note
 */
export async function isNoteOwner(note: Notes): Promise<boolean> {
  const currentUser = await getCurrentUser();
  return currentUser ? currentUser.$id === note.userId : false;
}

/**
 * Check if current user can read a note
 * Public notes can be read by anyone
 * Private notes can only be read by the owner
 */
export async function canReadNote(note: Notes): Promise<boolean> {
  // Public notes are readable by everyone
  if (isNotePublic(note)) {
    return true;
  }
  
  // Private notes are only readable by the owner
  return await isNoteOwner(note);
}

/**
 * Check if current user can edit a note
 * Only the owner can edit notes
 */
export async function canEditNote(note: Notes): Promise<boolean> {
  return await isNoteOwner(note);
}

/**
 * Check if current user can delete a note
 * Only the owner can delete notes
 */
export async function canDeleteNote(note: Notes): Promise<boolean> {
  return await isNoteOwner(note);
}

/**
 * Get the appropriate Appwrite permissions for a note based on its visibility
 */
export function getNotePermissions(isPublic: boolean, userId: string): string[] {
  const permissions = [
    // Owner has full access
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ];

  // If public, add read permission for everyone
  if (isPublic) {
    permissions.push(Permission.read(Role.any()));
  }

  return permissions;
}

/**
 * Generate shareable URL for a public note
 */
export function getShareableUrl(noteId: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URI || 'http://localhost:3001';
  
  return `${baseUrl}/shared/${noteId}`;
}

/**
 * Validate note access for public sharing
 * Returns the note if accessible, null if not found or not accessible
 */
export async function validatePublicNoteAccess(noteId: string): Promise<Notes | null> {
  try {
    // Try to get the note directly
    const note = await databases.getDocument(
      APPWRITE_DATABASE_ID, 
      APPWRITE_COLLECTION_ID_NOTES, 
      noteId
    ) as unknown as Notes;

    // Check if note is public
    if (!isNotePublic(note)) {
      return null;
    }

    return note;
  } catch (error) {
    // Note doesn't exist or no access
    return null;
  }
}

/**
 * Toggle note visibility between public and private
 */
export async function toggleNoteVisibility(noteId: string): Promise<Notes | null> {
  try {
    // Get current note
    const note = await databases.getDocument(
      APPWRITE_DATABASE_ID, 
      APPWRITE_COLLECTION_ID_NOTES, 
      noteId
    ) as unknown as Notes;

    // Check if user owns the note
    if (!(await isNoteOwner(note))) {
      throw new Error('Permission denied: You can only modify your own notes');
    }

    // Ensure we have a valid userId
    if (!note.userId) {
      throw new Error('Note does not have a valid user ID');
    }

    // Toggle visibility
    const newIsPublic = !isNotePublic(note);
    
    // Prepare permissions based on visibility
    let permissions;
    if (newIsPublic) {
      // Public note: allow read access for anyone, owner can update/delete
      permissions = [
        Permission.read(Role.any()),
        Permission.read(Role.user(note.userId)),
        Permission.update(Role.user(note.userId)),
        Permission.delete(Role.user(note.userId))
      ];
    } else {
      // Private note: only owner can read/update/delete
      permissions = [
        Permission.read(Role.user(note.userId)),
        Permission.update(Role.user(note.userId)),
        Permission.delete(Role.user(note.userId))
      ];
    }
    
    // Update the note with new visibility and permissions
    const updatedNote = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_NOTES,
      noteId,
      {
        isPublic: newIsPublic,
        updatedAt: new Date().toISOString()
      },
      permissions
    ) as unknown as Notes;

    return updatedNote;
  } catch (error) {
    console.error('Error toggling note visibility:', error);
    return null;
  }
}

/**
 * Make a note public
 */
export async function makeNotePublic(noteId: string): Promise<Notes | null> {
  try {
    const note = await databases.getDocument(
      APPWRITE_DATABASE_ID, 
      APPWRITE_COLLECTION_ID_NOTES, 
      noteId
    ) as unknown as Notes;

    if (!(await isNoteOwner(note))) {
      throw new Error('Permission denied: You can only modify your own notes');
    }

    // Ensure we have a valid userId
    if (!note.userId) {
      throw new Error('Note does not have a valid user ID');
    }

    // Set permissions for public access
    const permissions = [
      Permission.read(Role.any()),
      Permission.read(Role.user(note.userId)),
      Permission.update(Role.user(note.userId)),
      Permission.delete(Role.user(note.userId))
    ];

    const updatedNote = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_NOTES,
      noteId,
      {
        isPublic: true,
        updatedAt: new Date().toISOString()
      },
      permissions
    ) as unknown as Notes;

    return updatedNote;
  } catch (error) {
    console.error('Error making note public:', error);
    return null;
  }
}

/**
 * Make a note private
 */
export async function makeNotePrivate(noteId: string): Promise<Notes | null> {
  try {
    const note = await databases.getDocument(
      APPWRITE_DATABASE_ID, 
      APPWRITE_COLLECTION_ID_NOTES, 
      noteId
    ) as unknown as Notes;

    if (!(await isNoteOwner(note))) {
      throw new Error('Permission denied: You can only modify your own notes');
    }

    // Ensure we have a valid userId
    if (!note.userId) {
      throw new Error('Note does not have a valid user ID');
    }

    // Set permissions for private access (only owner)
    const permissions = [
      Permission.read(Role.user(note.userId)),
      Permission.update(Role.user(note.userId)),
      Permission.delete(Role.user(note.userId))
    ];

    const updatedNote = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_NOTES,
      noteId,
      {
        isPublic: false,
        updatedAt: new Date().toISOString()
      },
      permissions
    ) as unknown as Notes;

    return updatedNote;
  } catch (error) {
    console.error('Error making note private:', error);
    return null;
  }
}

/**
 * Get all public notes (for public feed/discovery)
 */
export async function getPublicNotes(limit: number = 50): Promise<{ documents: Notes[], total: number }> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID_NOTES,
      [
        // Only public notes
        // Query.equal('isPublic', true), // Commented out due to potential query limitations
        // Query.limit(limit),
        // Query.orderDesc('$createdAt')
      ]
    );

    // Filter public notes on the client side for now
    const publicNotes = response.documents.filter((doc: any) => doc.isPublic === true) as unknown as Notes[];
    
    return {
      documents: publicNotes.slice(0, limit),
      total: publicNotes.length
    };
  } catch (error) {
    console.error('Error fetching public notes:', error);
    return { documents: [], total: 0 };
  }
}