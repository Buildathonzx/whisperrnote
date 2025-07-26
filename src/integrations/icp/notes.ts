// ICP Note serialization and CRUD utilities
// Adapted from whisperrnote_icp/frontend/src/lib/note.ts and store/notes.ts

import type { _SERVICE, EncryptedNote } from './encrypted_notes.did';
import type { ActorSubclass } from '@dfinity/agent';

export interface NoteModel {
  id: bigint;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  owner: string;
  users?: string[];
  isPublic?: boolean;
  status?: string;
  parentNoteId?: string;
  attachments?: string[];
  comments?: string[];
  extensions?: string[];
  collaborators?: string[];
  metadata?: string;
}

// Helper to convert EncryptedNote (canister) to NoteModel (frontend)
function fromEncryptedNote(note: EncryptedNote): NoteModel {
  return {
    id: note.id,
    title: note.title?.[0] || '',
    content: note.content?.[0] || '',
    createdAt: note.created_at?.[0],
    updatedAt: note.updated_at?.[0],
    tags: note.tags?.[0] || [],
    owner: note.owner,
    users: note.users || [],
    isPublic: note.is_public?.[0],
    status: note.status?.[0],
    parentNoteId: note.parent_note_id?.[0],
    attachments: note.attachments?.[0],
    comments: note.comments?.[0],
    extensions: note.extensions?.[0],
    collaborators: note.collaborators?.[0],
    metadata: note.metadata?.[0],
  };
}

// Helper to convert NoteModel (frontend) to update_note args
function toUpdateNoteArgs(note: NoteModel): [
  bigint,
  string,
  (string | undefined)[],
  (string | undefined)[],
  (string[] | undefined)[],
  (string[] | undefined)[],
  (string[] | undefined)[],
  (string[] | undefined)[],
  (string[] | undefined)[],
  (string | undefined)[],
  (boolean | undefined)[],
  (string | undefined)[],
  (string | undefined)[]
] {
  return [
    note.id,
    note.content || '',
    note.title ? [note.title] : [],
    note.content ? [note.content] : [],
    note.tags ? [note.tags] : [],
    note.attachments ? [note.attachments] : [],
    note.comments ? [note.comments] : [],
    note.extensions ? [note.extensions] : [],
    note.collaborators ? [note.collaborators] : [],
    note.metadata ? [note.metadata] : [],
    note.isPublic !== undefined ? [note.isPublic] : [],
    note.status ? [note.status] : [],
    note.parentNoteId ? [note.parentNoteId] : [],
  ];
}

export async function fetchNotes(actor: ActorSubclass<_SERVICE>): Promise<NoteModel[]> {
  const notes: EncryptedNote[] = await actor.get_notes();
  return notes.map(fromEncryptedNote);
}

export async function createNote(actor: ActorSubclass<_SERVICE>, note: NoteModel): Promise<bigint> {
  // 1. Create empty note, get id
  const id = await actor.create_note();
  // 2. Update note with all fields
  await actor.update_note(...toUpdateNoteArgs({ ...note, id }));
  return id;
}

export async function updateNote(actor: ActorSubclass<_SERVICE>, note: NoteModel): Promise<void> {
  await actor.update_note(...toUpdateNoteArgs(note));
}

export async function deleteNote(actor: ActorSubclass<_SERVICE>, id: bigint): Promise<void> {
  await actor.delete_note(id);
}
