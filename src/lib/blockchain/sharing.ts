import { Actor } from '@dfinity/agent';
import { NoteSharing } from './types';
import { getContextId } from '../calimero/config';
import { getConfigAndJwt } from '../calimero/client';

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