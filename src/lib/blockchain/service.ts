import { Actor } from '@dfinity/agent';
import { BlockchainService, CreateProposalRequest, Proposal, ApprovalRequest } from './types';
import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';
import { getContextId, getNodeUrl } from '../calimero/config';
import { getConfigAndJwt } from '../calimero/client';

export class BlockchainServiceImpl implements BlockchainService {
  private actor: Actor;

  constructor(actor: Actor) {
    this.actor = actor;
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
}