import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';

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