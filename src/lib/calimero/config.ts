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

export const CALIMERO_CONFIG = {
  API_ENDPOINT: process.env.NEXT_PUBLIC_CALIMERO_ENDPOINT || 'https://api.calimero.network/v1',
  WS_ENDPOINT: process.env.NEXT_PUBLIC_CALIMERO_WS_ENDPOINT || 'wss://api.calimero.network/v1/ws',
  API_KEY: process.env.CALIMERO_API_KEY || '',
  CONTEXT_ID: process.env.CALIMERO_CONTEXT_ID || '',
  SYNC_INTERVAL: 5000, // 5 seconds
  MAX_SYNC_RETRIES: 3,
  BACKUP_ENABLED: true,
};

export const NOTE_CONFIG = {
  MIN_SHARES: 2,
  TOTAL_SHARES: 5,
  KEY_SIZE: 256,
  ENCRYPTION_ALGO: 'AES-GCM',
  MAX_NOTE_SIZE: 1024 * 1024 * 5, // 5MB
};

export const AUTH_CONFIG = {
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 3,
  LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
};
