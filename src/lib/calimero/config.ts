import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearJWT,
} from '@calimero-network/calimero-client';

export function getNodeUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'https://example.com';
}

export function getApplicationId() {
  return process.env.NEXT_PUBLIC_APPLICATION_ID || 'my-app-id';
}

export function storeTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function removeStoredTokens() {
  clearJWT();
}

export function retrieveTokens() {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}
