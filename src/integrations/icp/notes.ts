// ICP Note serialization and CRUD utilities
// Adapted from whisperrnote_icp/frontend/src/lib/note.ts and store/notes.ts

import type { BackendActor } from './agent';

export interface NoteModel {
  id: bigint;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  owner: string;
  users: string[];
}

export async function fetchNotes(actor: BackendActor): Promise<NoteModel[]> {
  // TODO: Call actor.get_notes() and deserialize
  return [];
}

export async function createNote(actor: BackendActor, note: NoteModel): Promise<bigint> {
  // TODO: Call actor.create_note() and actor.update_note()
  return BigInt(0);
}

export async function updateNote(actor: BackendActor, note: NoteModel): Promise<void> {
  // TODO: Call actor.update_note()
}
