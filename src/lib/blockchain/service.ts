import { Actor } from '@dfinity/agent';
import { BlockchainService, CreateProposalRequest, Proposal, ApprovalRequest } from './types';
import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';
import { getContextId, getNodeUrl } from '../calimero/config';
import { getConfigAndJwt } from '../calimero/client';
import { ICPClient } from '../icp/client';
import { CalimeroStorage } from '../calimero/storage';
import { CalimeroWebSocket } from '../calimero/ws';
import { NoteShareService } from './sharing';
import { Note } from '@/types/notes';
import { decryptNote, encryptNote, generateEncryptionKey } from '../encryption/crypto';

export class BlockchainServiceImpl implements BlockchainService {
  private actor: Actor;
  private shareService: NoteShareService;
  private ws: CalimeroWebSocket;

  constructor(
    actor: Actor,
    private readonly icpClient: ICPClient,
    private readonly calimeroStorage: CalimeroStorage
  ) {
    this.actor = actor;
    this.shareService = new NoteShareService(icpClient, calimeroStorage);
    this.ws = new CalimeroWebSocket(process.env.NEXT_PUBLIC_CALIMERO_WS_ENDPOINT!);

    // Start WebSocket connection
    this.ws.connect();

    // Set up sync handlers
    this.setupSyncHandlers();
  }

  private setupSyncHandlers() {
    this.ws.subscribe('note_updated', async (data) => {
      const { noteId, version, encryptedContent } = data;
      await this.handleNoteSync(noteId, version, encryptedContent);
    });

    this.ws.subscribe('note_shared', async (data) => {
      const { noteId, sharedBy, encryptedKeyShare } = data;
      await this.handleNoteShared(noteId, sharedBy, encryptedKeyShare);
    });
  }

  async getProposal(id: string): Promise<ApiResponse<Proposal>> {
    try {
      const { jwtObject, error } = await getConfigAndJwt();
      if (error) return { error };

      const result = await this.actor.query_raw({
        methodName: 'get_proposal',
        arg: id,
        context: jwtObject.context_id
      });

      return {
        data: result as Proposal,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async createProposal(request: CreateProposalRequest): Promise<ApiResponse<string>> {
    try {
      const { jwtObject, error } = await getConfigAndJwt();
      if (error) return { error };

      const result = await this.actor.update_raw({
        methodName: 'create_proposal',
        arg: request.action,
        context: jwtObject.context_id
      });

      return {
        data: result as string,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  async approveProposal(request: ApprovalRequest): Promise<ApiResponse<void>> {
    try {
      const { jwtObject, error } = await getConfigAndJwt();
      if (error) return { error };

      await this.actor.update_raw({
        methodName: 'approve_proposal',
        arg: request.proposal_id,
        context: jwtObject.context_id
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async executeProposal(id: string): Promise<ApiResponse<void>> {
    try {
      const { jwtObject, error } = await getConfigAndJwt();
      if (error) return { error };

      await this.actor.update_raw({
        methodName: 'execute_proposal',
        arg: id,
        context: jwtObject.context_id
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async createNote(content: string, title: string, isEncrypted: boolean = true): Promise<string> {
    // Generate encryption keys if needed
    let noteId: string;
    
    if (isEncrypted) {
      const { publicKey, privateKey } = await generateEncryptionKey();
      const { encryptedContent, encryptedKey, iv } = await encryptNote(content, publicKey);
      
      // Store note on ICP
      noteId = await this.icpClient.createNote(encryptedContent, title, publicKey);
      
      // Store private key securely
      localStorage.setItem(`note_key_${noteId}`, privateKey);
    } else {
      // Store unencrypted note
      noteId = await this.icpClient.createNote(content, title, null);
    }

    // Backup to Calimero
    await this.calimeroStorage.storeNoteBackup({
      id: noteId,
      title,
      content: isEncrypted ? '' : content,
      isEncrypted,
      version: 1,
      updatedAt: new Date(),
    } as Note);

    return noteId;
  }

  async getNote(noteId: string): Promise<Note> {
    // Get note from ICP
    const note = await this.icpClient.getNote(noteId);
    
    // If encrypted, decrypt content
    if (note.isEncrypted) {
      const privateKey = localStorage.getItem(`note_key_${noteId}`);
      if (!privateKey) {
        throw new Error('Note key not found');
      }
      
      note.content = await decryptNote(
        note.encryptedContent!,
        note.encrypted_key,
        note.iv,
        privateKey
      );
    }

    // Sync with Calimero backup
    await this.calimeroStorage.syncNote(note);

    return note;
  }

  async updateNote(noteId: string, content: string, title?: string): Promise<void> {
    const note = await this.getNote(noteId);
    
    if (note.isEncrypted) {
      const privateKey = localStorage.getItem(`note_key_${noteId}`);
      if (!privateKey) {
        throw new Error('Note key not found');
      }
      
      // Re-encrypt with same key
      const { publicKey } = await generateEncryptionKey();
      await this.icpClient.updateNote(noteId, content, publicKey, { title });
    } else {
      await this.icpClient.updateNote(noteId, content, null, { title });
    }

    // Update backup
    await this.calimeroStorage.syncNote({
      ...note,
      content,
      title: title || note.title,
      version: note.version + 1,
      updatedAt: new Date()
    });
  }

  async shareNote(noteId: string, recipientIds: string[]): Promise<void> {
    const note = await this.getNote(noteId);
    if (!note.isEncrypted) {
      throw new Error('Cannot share unencrypted notes');
    }

    const privateKey = localStorage.getItem(`note_key_${noteId}`);
    if (!privateKey) {
      throw new Error('Note key not found');
    }

    await this.shareService.shareNote(noteId, recipientIds, privateKey);
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.icpClient.deleteNote(noteId);
    localStorage.removeItem(`note_key_${noteId}`);
  }

  private async handleNoteSync(noteId: string, version: number, encryptedContent: string) {
    // Implement sync conflict resolution
    const localNote = await this.getNote(noteId);
    if (version > localNote.version) {
      // Remote version is newer, update local
      await this.updateNote(noteId, encryptedContent);
    }
  }

  private async handleNoteShared(noteId: string, sharedBy: string, encryptedKeyShare: string) {
    // Store the encrypted key share
    localStorage.setItem(`note_key_share_${noteId}`, encryptedKeyShare);
  }

  disconnect() {
    this.ws.disconnect();
  }
}