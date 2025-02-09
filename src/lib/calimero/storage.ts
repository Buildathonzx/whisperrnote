import { CALIMERO_API_KEY } from '@/config';
import { Note } from '@/types/notes';

export class CalimeroStorage {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = CALIMERO_API_KEY;
    this.endpoint = process.env.NEXT_PUBLIC_CALIMERO_ENDPOINT!;
  }

  async storeNoteBackup(note: Note): Promise<string> {
    const response = await fetch(`${this.endpoint}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id: note.id,
        encrypted_content: note.encryptedContent,
        metadata: {
          title: note.title,
          version: note.version,
          updated_at: note.updatedAt.toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to store note backup');
    }

    return note.id;
  }

  async getNoteBackup(noteId: string): Promise<{
    encryptedContent: string;
    version: number;
  }> {
    const response = await fetch(`${this.endpoint}/notes/${noteId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve note backup');
    }

    const data = await response.json();
    return {
      encryptedContent: data.encrypted_content,
      version: data.metadata.version
    };
  }

  async syncNote(note: Note): Promise<void> {
    try {
      const backup = await this.getNoteBackup(note.id);
      
      // If local version is newer, update backup
      if (note.version > backup.version) {
        await this.storeNoteBackup(note);
      }
      // If backup is newer, we could trigger a conflict resolution
      else if (backup.version > note.version) {
        // Implement conflict resolution strategy
        console.warn('Note conflict detected:', note.id);
      }
    } catch (error) {
      if ((error as Error).message === 'Failed to retrieve note backup') {
        // Note doesn't exist in backup, create it
        await this.storeNoteBackup(note);
      } else {
        throw error;
      }
    }
  }

  async listBackups(): Promise<Array<{id: string; title: string; updatedAt: Date}>> {
    const response = await fetch(`${this.endpoint}/notes`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list note backups');
    }

    const data = await response.json();
    return data.notes.map((note: any) => ({
      id: note.note_id,
      title: note.metadata.title,
      updatedAt: new Date(note.metadata.updated_at)
    }));
  }
}

export const storeNote = async (encryptedNote: string) => {
  // Placeholder for storing encrypted note on Calimero
  console.log('Storing note on Calimero:', encryptedNote);
};

export const getNote = async (noteId: string) => {
  // Placeholder for retrieving encrypted note from Calimero
  console.log('Retrieving note from Calimero:', noteId);
  return "Encrypted Note Content"; // Return encrypted content
};
