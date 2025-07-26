// ICP Agent and Actor setup
// Adapted from whisperrnote_icp/frontend/src/lib/actor.ts

import { Actor, HttpAgent, ActorConfig, ActorSubclass, HttpAgentOptions } from '@dfinity/agent';
// import idlFactory and _SERVICE from generated Candid bindings (to be added)
// import { idlFactory, _SERVICE } from './declarations/encrypted_notes.did';

export type BackendActor = ActorSubclass<any>; // Replace 'any' with _SERVICE when available

export function createActor(options?: {
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
}): BackendActor {
  const hostOptions = {
    host:
      process.env.NEXT_PUBLIC_ICP_NETWORK === 'ic'
        ? `https://${process.env.NEXT_PUBLIC_ICP_CANISTER_ID}.ic0.app`
        : 'http://localhost:8000',
  };
  if (!options) {
    options = {
      agentOptions: hostOptions,
    };
  } else if (!options.agentOptions) {
    options.agentOptions = hostOptions;
  } else {
    options.agentOptions.host = hostOptions.host;
  }

  const agent = new HttpAgent({ ...options.agentOptions });
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  // TODO: Replace with actual idlFactory and canisterId
  return Actor.createActor({} as any, {
    agent,
    canisterId: process.env.NEXT_PUBLIC_ICP_CANISTER_ID,
    ...options?.actorOptions,
  });
}
