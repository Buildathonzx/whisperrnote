import { Actor, HttpAgent } from '@dfinity/agent';
import { ICPConfig, ICPError, ICPActor } from './types';
import { getICPConfig, validateICPConfig } from './config';

const idlFactory = ({ IDL }: any) => {
  const NoteData = IDL.Record({
    'id': IDL.Text,
    'title': IDL.Text,
    'content': IDL.Text,
    'encrypted': IDL.Bool,
    'owner': IDL.Text,
    'createdAt': IDL.Nat64,
    'updatedAt': IDL.Nat64,
  });

  const CreateNoteRequest = IDL.Record({
    'title': IDL.Text,
    'content': IDL.Text,
    'encrypted': IDL.Opt(IDL.Bool),
  });

  const UpdateNoteRequest = IDL.Record({
    'id': IDL.Text,
    'title': IDL.Opt(IDL.Text),
    'content': IDL.Opt(IDL.Text),
  });

  return IDL.Service({
    'createNote': IDL.Func([CreateNoteRequest], [IDL.Text], []),
    'updateNote': IDL.Func([UpdateNoteRequest], [IDL.Bool], []),
    'getNote': IDL.Func([IDL.Text], [IDL.Opt(NoteData)], ['query']),
    'getUserNotes': IDL.Func([IDL.Text], [IDL.Vec(NoteData)], ['query']),
    'deleteNote': IDL.Func([IDL.Text], [IDL.Bool], []),
  });
};

export class ICPClient {
  private agent: HttpAgent;
  private actor: ICPActor | null = null;
  private config: ICPConfig;

  constructor(config: ICPConfig) {
    if (!validateICPConfig(config)) {
      throw new Error('Invalid ICP configuration provided');
    }

    this.config = config;
    this.agent = new HttpAgent({
      host: config.host,
    });

    if (config.network === 'local') {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }
  }

  static createFromEnv(): ICPClient {
    const config = getICPConfig();
    return new ICPClient(config);
  }

  private async getActor(): Promise<ICPActor> {
    if (!this.actor) {
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.config.canisterId,
      }) as ICPActor;
    }
    return this.actor;
  }

  async createNote(request: { title: string; content: string; encrypted?: boolean }): Promise<string> {
    try {
      const actor = await this.getActor();
      const result = await actor.createNote(request);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNote(request: { id: string; title?: string; content?: string }): Promise<boolean> {
    try {
      const actor = await this.getActor();
      const result = await actor.updateNote(request);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNote(id: string): Promise<any> {
    try {
      const actor = await this.getActor();
      const result = await actor.getNote(id);
      return result && Array.isArray(result) && result.length > 0 ? result[0] : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserNotes(owner: string): Promise<any[]> {
    try {
      const actor = await this.getActor();
      const result = await actor.getUserNotes(owner);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const actor = await this.getActor();
      const result = await actor.deleteNote(id);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ICPError {
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('connection')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to ICP network',
          details: error,
        };
      }
      
      if (error.message.includes('canister') || error.message.includes('replica')) {
        return {
          code: 'CANISTER_ERROR',
          message: 'Smart contract execution failed',
          details: error,
        };
      }
      
      if (error.message.includes('auth') || error.message.includes('principal')) {
        return {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed',
          details: error,
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: error,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }
}

let icpClient: ICPClient | null = null;

export function getICPClient(): ICPClient {
  if (!icpClient) {
    icpClient = ICPClient.createFromEnv();
  }
  return icpClient;
}

export function resetICPClient(): void {
  icpClient = null;
}