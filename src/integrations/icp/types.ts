import { ActorSubclass } from '@dfinity/agent';

export interface ICPConfig {
  canisterId: string;
  network: 'local' | 'ic';
  host?: string;
}

export interface ICPError {
  code: 'NETWORK_ERROR' | 'CANISTER_ERROR' | 'AUTHENTICATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: unknown;
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  owner: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  encrypted?: boolean;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
}

export interface ICPNoteService {
  createNote: (request: CreateNoteRequest) => Promise<string>;
  updateNote: (request: UpdateNoteRequest) => Promise<boolean>;
  getNote: (id: string) => Promise<NoteData | null>;
  getUserNotes: (owner: string) => Promise<NoteData[]>;
  deleteNote: (id: string) => Promise<boolean>;
}

export type ICPActor = ActorSubclass<ICPNoteService>;