import { Actor } from '@dfinity/agent';
import { NoteSharing } from './types';
import { getContextId } from '../calimero/config';
import { getConfigAndJwt } from '../calimero/client';
import { generateKeyShares } from '../encryption/crypto';
import { ICPClient } from '../icp/client';
import { CalimeroStorage } from '../calimero/storage';
import { Note, ShareRequest } from '@/types/notes';

export class NoteSharingService implements NoteSharing {
  private actor: Actor;

  constructor(actor: Actor) {
    this.actor = actor;
  }

  async shareNote(noteId: string, recipient: string, encryptedKey: Uint8Array): Promise<void> {
    const { jwtObject, error } = await getConfigAndJwt();
    if (error) throw error;

    await this.actor.update_raw({
      methodName: 'share_note',
      args: {
        note_id: noteId,
        recipient,
        encrypted_key: Array.from(encryptedKey)
      },
      context: jwtObject.context_id
    });
  }

  async getSharedContext(noteId: string): Promise<string[]> {
    const { jwtObject, error } = await getConfigAndJwt();
    if (error) throw error;

    const result = await this.actor.query_raw({
      methodName: 'get_shared_context',
      arg: noteId,
      context: jwtObject.context_id
    });

    return result as string[];
  }
}

export class NoteShareService {
  constructor(
    private readonly icpClient: ICPClient,
    private readonly calimeroStorage: CalimeroStorage
  ) {}

  async shareNote(
    noteId: string,
    recipientIds: string[],
    noteKey: string
  ): Promise<void> {
    // Generate key shares using Shamir's Secret Sharing
    const keyShares = await generateKeyShares(noteKey, recipientIds.length, Math.ceil(recipientIds.length / 2));

    // Share encrypted key shares with each recipient
    await Promise.all(recipientIds.map(async (recipientId, index) => {
      const shareRequest: ShareRequest = {
        noteId,
        recipientId,
        encryptedKeyShare: keyShares[index]
      };

      // Share through ICP
      await this.icpClient.shareNote(
        noteId,
        recipientId,
        new TextEncoder().encode(keyShares[index])
      );

      // Backup sharing info to Calimero
      await this.calimeroStorage.storeNoteBackup({
        id: noteId,
        sharedWith: [...recipientIds],
        version: Date.now()
      } as Note);
    }));
  }

  async getSharedNotes(): Promise<string[]> {
    const notes = await this.icpClient.listNotes();
    return notes
      .filter(note => note.sharedWith?.includes(this.icpClient.getPrincipal()))
      .map(note => note.id);
  }

  async revokeAccess(noteId: string, recipientId: string): Promise<void> {
    // Implement access revocation logic
    // This would typically involve re-encrypting the note with a new key
    // and sharing it with all remaining recipients except the revoked one
    throw new Error('Not implemented');
  }
}