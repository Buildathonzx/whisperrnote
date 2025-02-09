import { Actor, ActorConfig } from '@dfinity/agent';
import { getNodeUrl } from '../calimero/config';
import { BlockchainServiceImpl } from './service';
import { NoteSharingService } from './sharing';

// Create blockchain actor config
const createActorConfig = (): ActorConfig => ({
  canisterId: process.env.BLOCKCHAIN_CANISTER_ID || '',
  agentOptions: {
    host: getNodeUrl()
  }
});

// Service factory
export const createBlockchainServices = (actor: Actor) => ({
  blockchain: new BlockchainServiceImpl(actor),
  sharing: new NoteSharingService(actor)
});

// Entry point for blockchain integration
export const useBlockchainServices = () => {
  // Initialize actor with config
  const actor = Actor.createActor(createActorConfig());
  return createBlockchainServices(actor);
};