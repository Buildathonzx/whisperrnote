// ICP Authentication utilities
// Adapted from whisperrnote_icp/frontend/src/store/auth.ts

import { AuthClient } from '@dfinity/auth-client';
import { createActor, BackendActor } from './agent';

export type AuthState =
  | { state: 'initializing-auth' }
  | { state: 'anonymous'; actor: BackendActor; client: AuthClient }
  | { state: 'initialized'; actor: BackendActor; client: AuthClient };

export async function initAuth(): Promise<AuthState> {
  const client = await AuthClient.create();
  if (await client.isAuthenticated()) {
    return authenticate(client);
  } else {
    return {
      state: 'anonymous',
      actor: createActor(),
      client,
    };
  }
}

export async function authenticate(client: AuthClient): Promise<AuthState> {
  const actor = createActor({
    agentOptions: {
      identity: client.getIdentity(),
    },
  });
  return {
    state: 'initialized',
    actor,
    client,
  };
}
