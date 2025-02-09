import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '@/lib/declarations/notes';
import { decryptNote, encryptNote } from '@/lib/encryption/crypto';

interface NoteActor {
  create_note: (note: any) => Promise<string>;
  get_note: (noteId: string) => Promise<any>;
  list_notes: () => Promise<any[]>;
  share_note: (request: any) => Promise<void>;
  update_note: (noteId: string, content: Uint8Array, metadata?: any) => Promise<void>;
  delete_note: (noteId: string) => Promise<void>;
}

export class ICPClient {
  private agent: HttpAgent;
  private noteActor: NoteActor;
  private userPrincipal: Principal;

  constructor(identity: any) {
    this.agent = new HttpAgent({
      identity,
      host: process.env.NEXT_PUBLIC_IC_HOST
    });

    if (process.env.NODE_ENV !== 'production') {
      this.agent.fetchRootKey().catch(console.error);
    }

    this.noteActor = Actor.createActor<NoteActor>(idlFactory, {
      agent: this.agent,
      canisterId: process.env.NEXT_PUBLIC_NOTES_CANISTER_ID!
    });

    this.userPrincipal = identity.getPrincipal();
  }

  async createNote(content: string, title: string, publicKey: string): Promise<string> {
    const { encryptedContent, encryptedKey, iv } = await encryptNote(content, publicKey);

    const note = {
      id: crypto.randomUUID(),
      encrypted_content: Array.from(Buffer.from(encryptedContent, 'base64')),
      encrypted_key: Array.from(Buffer.from(encryptedKey, 'base64')),
      iv: Array.from(Buffer.from(iv, 'base64')),
      owner_id: this.userPrincipal,
      shared_with: [],
      metadata: {
        title,
        tags: [],
        created_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now())
      },
      version: BigInt(0)
    };

    return this.noteActor.create_note(note);
  }

  async getNote(noteId: string, privateKey: string): Promise<{
    id: string;
    content: string;
    title: string;
    sharedWith: string[];
  }> {
    const note = await this.noteActor.get_note(noteId);
    if (!note) throw new Error('Note not found');

    const content = await decryptNote(
      Buffer.from(note.encrypted_content).toString('base64'),
      Buffer.from(note.encrypted_key).toString('base64'),
      Buffer.from(note.iv).toString('base64'),
      privateKey
    );

    return {
      id: note.id,
      content,
      title: note.metadata.title,
      sharedWith: note.shared_with.map(p => p.toText())
    };
  }

  async listNotes(): Promise<Array<{id: string; title: string; updatedAt: Date}>> {
    const notes = await this.noteActor.list_notes();
    return notes.map(note => ({
      id: note.id,
      title: note.metadata.title,
      updatedAt: new Date(Number(note.metadata.updated_at))
    }));
  }

  async shareNote(noteId: string, recipientId: string, encryptedKeyShare: Uint8Array): Promise<void> {
    await this.noteActor.share_note({
      note_id: noteId,
      recipient: Principal.fromText(recipientId),
      encrypted_key_share: Array.from(encryptedKeyShare)
    });
  }

  async updateNote(
    noteId: string, 
    content: string,
    publicKey: string,
    metadata?: { title?: string; tags?: string[] }
  ): Promise<void> {
    const { encryptedContent } = await encryptNote(content, publicKey);
    const encryptedContentBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
    
    await this.noteActor.update_note(noteId, encryptedContentBytes, metadata);
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.noteActor.delete_note(noteId);
  }
}
