export interface Note {
  id: string;
  title: string;
  content: string;
  encryptedContent?: string;
  isEncrypted: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  sharedWith: string[];
  collectionId?: string;
  version: number;
}

export interface NoteCollection {
  id: string;
  name: string;
  ownerId: string;
  notes: Note[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareRequest {
  noteId: string;
  recipientId: string;
  encryptedKeyShare: string;
}

export interface EncryptedKeyShare {
  shareId: string;
  encryptedData: string;
  recipientId: string;
}

export interface NoteMetadata {
  title: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
