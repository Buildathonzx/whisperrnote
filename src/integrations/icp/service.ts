import { getICPClient } from './client';
import { isICPEnabled } from './config';

export class ICPService {
  private static instance: ICPService | null = null;

  static getInstance(): ICPService {
    if (!ICPService.instance) {
      ICPService.instance = new ICPService();
    }
    return ICPService.instance;
  }

  async isAvailable(): Promise<boolean> {
    try {
      return isICPEnabled();
    } catch {
      return false;
    }
  }

  async syncNoteToICP(noteData: {
    id: string;
    title: string;
    content: string;
    userId: string;
    encrypted?: boolean;
  }): Promise<string | null> {
    if (!(await this.isAvailable())) {
      console.log('ICP integration is disabled');
      return null;
    }

    try {
      const client = getICPClient();
      const icpNoteId = await client.createNote({
        title: noteData.title,
        content: noteData.content,
        encrypted: noteData.encrypted || false,
      });
      
      console.log('Note synced to ICP with ID:', icpNoteId);
      return icpNoteId;
    } catch (error) {
      console.error('Failed to sync note to ICP:', error);
      return null;
    }
  }

  async updateNoteOnICP(noteData: {
    icpId: string;
    title?: string;
    content?: string;
  }): Promise<boolean> {
    if (!(await this.isAvailable())) {
      return false;
    }

    try {
      const client = getICPClient();
      const success = await client.updateNote({
        id: noteData.icpId,
        title: noteData.title,
        content: noteData.content,
      });
      
      console.log('Note updated on ICP:', success);
      return success;
    } catch (error) {
      console.error('Failed to update note on ICP:', error);
      return false;
    }
  }

  async getNoteFromICP(icpId: string): Promise<any> {
    if (!(await this.isAvailable())) {
      return null;
    }

    try {
      const client = getICPClient();
      const note = await client.getNote(icpId);
      return note;
    } catch (error) {
      console.error('Failed to get note from ICP:', error);
      return null;
    }
  }

  async getUserNotesFromICP(userId: string): Promise<any[]> {
    if (!(await this.isAvailable())) {
      return [];
    }

    try {
      const client = getICPClient();
      const notes = await client.getUserNotes(userId);
      return notes;
    } catch (error) {
      console.error('Failed to get user notes from ICP:', error);
      return [];
    }
  }

  async deleteNoteFromICP(icpId: string): Promise<boolean> {
    if (!(await this.isAvailable())) {
      return false;
    }

    try {
      const client = getICPClient();
      const success = await client.deleteNote(icpId);
      
      console.log('Note deleted from ICP:', success);
      return success;
    } catch (error) {
      console.error('Failed to delete note from ICP:', error);
      return false;
    }
  }
}

export function getICPService(): ICPService {
  return ICPService.getInstance();
}