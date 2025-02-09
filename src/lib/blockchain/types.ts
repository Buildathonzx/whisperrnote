import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';
import { Principal } from '@dfinity/principal';

export interface ProposalAction {
  scope: string;
  params: {
    receiver_id?: string;
    method_name?: string;
    args?: string;
    amount?: string;
    deposit?: string;
  };
}

export interface Proposal {
  id: string;
  author: string;
  actions: ProposalAction[];
  approvals: string[];
  min_approvals: number;
}

export interface CreateProposalRequest {
  action: ProposalAction;
}

export interface ApprovalRequest {
  proposal_id: string;
}

export interface BlockchainService {
  getProposal(id: string): Promise<ApiResponse<Proposal>>;
  createProposal(request: CreateProposalRequest): Promise<ApiResponse<string>>;
  approveProposal(request: ApprovalRequest): Promise<ApiResponse<void>>;
  executeProposal(id: string): Promise<ApiResponse<void>>;
}

export interface NoteSharing {
  shareNote(noteId: string, recipient: string, encryptedKey: Uint8Array): Promise<void>;
  getSharedContext(noteId: string): Promise<string[]>;
}

export interface BlockchainConfig {
  icpHost: string;
  calimeroEndpoint: string;
  calimeroWsEndpoint: string;
  notesCanisterId: string;
}

export interface ICProposal {
  id: string;
  actions: ICProposalAction[];
  authorId: string;
}

export interface ICProposalAction {
  type: 'SetNoteContent' | 'ShareNote' | 'DeleteNote';
  params: {
    noteId?: string;
    content?: string;
    recipientId?: string;
    encryptedKeyShare?: string;
  };
}

export interface NoteState {
  noteId: string;
  version: number;
  lastSync: number;
  conflictResolution?: 'local' | 'remote';
}

export interface NoteKeyShare {
  noteId: string;
  shareId: string;
  recipientId: string;
  encryptedShare: string;
}

export interface SyncStatus {
  inProgress: boolean;
  lastSyncTime: number;
  pendingChanges: number;
}