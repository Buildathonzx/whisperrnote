import { CalimeroStorage } from './storage';
import { Note } from '@/types/notes';

export class CalimeroWebSocket {
  private ws: WebSocket | null = null;
  private storage: CalimeroStorage;
  private messageHandlers: Map<string, (data: any) => void>;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(private readonly endpoint: string) {
    this.storage = new CalimeroStorage();
    this.messageHandlers = new Map();
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.endpoint);
    
    this.ws.onopen = () => {
      console.log('Connected to Calimero WebSocket');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'NOTE_UPDATED':
            await this.handleNoteUpdate(message.data);
            break;
          case 'NOTE_SHARED':
            await this.handleNoteShare(message.data);
            break;
          case 'SYNC_REQUEST':
            await this.handleSyncRequest(message.data);
            break;
        }

        // Call any registered handlers for this message type
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message.data);
        }
      } catch (error) {
        console.error('Failed to process WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private async handleNoteUpdate(data: { noteId: string; version: number }) {
    try {
      const backup = await this.storage.getNoteBackup(data.noteId);
      
      // Notify subscribers about the update
      this.notify('note_updated', {
        noteId: data.noteId,
        version: backup.version,
        encryptedContent: backup.encryptedContent
      });
    } catch (error) {
      console.error('Failed to handle note update:', error);
    }
  }

  private async handleNoteShare(data: { 
    noteId: string; 
    sharedBy: string;
    encryptedKeyShare: string;
  }) {
    this.notify('note_shared', data);
  }

  private async handleSyncRequest(data: { noteId: string }) {
    try {
      const backup = await this.storage.getNoteBackup(data.noteId);
      
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'SYNC_RESPONSE',
          data: {
            noteId: data.noteId,
            version: backup.version,
            encryptedContent: backup.encryptedContent
          }
        }));
      }
    } catch (error) {
      console.error('Failed to handle sync request:', error);
    }
  }

  subscribe(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  unsubscribe(messageType: string) {
    this.messageHandlers.delete(messageType);
  }

  private notify(event: string, data: any) {
    const handler = this.messageHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  async syncNote(note: Note) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'SYNC_REQUEST',
      data: {
        noteId: note.id,
        version: note.version
      }
    }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}