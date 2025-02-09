export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
}

export interface CreateNoteResponse {
  note: Note;
}

export interface ListNotesResponse {
  notes: Note[];
}
