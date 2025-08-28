// Stateless nonce utilities (HMAC-signed token) for wallet auth (prod-ready, no DB)
// Previous in-memory store removed. This is horizontally scalable.

import { createHmac, randomBytes } from 'crypto';

export type NoncePayload = {
  addr: string; // lowercase address
  iat: number; // issued at (epoch ms)
  exp: number; // expires at (epoch ms)
  nonce: string; // random token id
  version: string; // SIWE version
  chainId: number;
  domain: string;
  uri: string;
};

const b64url = (buf: Buffer) => buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

function getSecret(): string {
  const secret = process.env.SERVER_NONCE_SECRET;
  if (!secret) throw new Error('SERVER_NONCE_SECRET not set');
  return secret;
}

export function signNonce(payload: NoncePayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json, 'utf8');
  const sig = createHmac('sha256', getSecret()).update(data).digest();
  return `${b64url(data)}.${b64url(sig)}`;
}

export function verifyNonce(token: string): NoncePayload {
  const [dataB64, sigB64] = token.split('.');
  if (!dataB64 || !sigB64) throw new Error('Invalid nonce token');
  const data = Buffer.from(dataB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const expected = createHmac('sha256', getSecret()).update(data).digest();
  const actual = Buffer.from(sigB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  if (actual.length !== expected.length || !expected.equals(actual)) throw new Error('Invalid nonce signature');
  const payload = JSON.parse(data.toString('utf8')) as NoncePayload;
  if (Date.now() > payload.exp) throw new Error('Nonce expired');
  return payload;
}

export function issueNonce(address: string) {
  const addr = address.toLowerCase();
  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 minutes
  const nonce = randomBytes(16).toString('hex');
  const version = String(process.env.AUTH_SIWE_VERSION || '1');
  const chainId = Number(process.env.AUTH_CHAIN_ID || 1);
  const domain = String(process.env.AUTH_DOMAIN || 'localhost');
  const uri = String(process.env.AUTH_URI || 'http://localhost:3000');
  const payload: NoncePayload = { addr, iat: now, exp: now + ttlMs, nonce, version, chainId, domain, uri };
  const token = signNonce(payload);
  return { token, payload };
}
