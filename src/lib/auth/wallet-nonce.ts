import crypto from 'crypto';

// Base64url helpers
function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64');
}

export interface NoncePayload {
  addr: string;
  iat: number; // issued at (unix seconds)
  exp: number; // expires at (unix seconds)
  nonce: string;
  version: string;
  chainId: number;
  domain: string;
  uri: string;
}

const VERSION = '1';

export function createNonceToken(params: {
  addr: string;
  chainId: number;
  domain: string;
  uri: string;
  ttlSeconds?: number;
  serverSecret?: string;
}): { token: string; payload: NoncePayload } {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(60, Math.min(15 * 60, params.ttlSeconds ?? 5 * 60)); // 5m default, clamp 1-15m
  const payload: NoncePayload = {
    addr: params.addr.toLowerCase(),
    iat: now,
    exp: now + ttl,
    nonce: crypto.randomBytes(16).toString('hex'),
    version: VERSION,
    chainId: params.chainId,
    domain: params.domain,
    uri: params.uri,
  };

  const secret = params.serverSecret ?? process.env.SERVER_NONCE_SECRET ?? '';
  if (!secret) throw new Error('SERVER_NONCE_SECRET not set');

  const header = { alg: 'HS256', typ: 'JWT', kid: 'nonce-hmac-v1' };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  const token = `${data}.${base64url(sig)}`;
  return { token, payload };
}

export function verifyNonceToken(token: string, opts?: { serverSecret?: string }): NoncePayload | null {
  try {
    const secret = opts?.serverSecret ?? process.env.SERVER_NONCE_SECRET ?? '';
    if (!secret) throw new Error('SERVER_NONCE_SECRET not set');

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encHeader, encPayload, encSig] = parts;
    const data = `${encHeader}.${encPayload}`;
    const expected = crypto.createHmac('sha256', secret).update(data).digest();
    const got = base64urlDecode(encSig);
    if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return null;

    const payload = JSON.parse(base64urlDecode(encPayload).toString()) as NoncePayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.iat > now + 60) return null; // future iat skew
    if (payload.exp < now) return null; // expired
    if (!payload.addr || !/^0x[a-f0-9]{40}$/.test(payload.addr)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildSiweMessage(fields: {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string; // ISO
  expirationTime: string; // ISO
}): string {
  return `${fields.domain} wants you to sign in with your Ethereum account:\n` +
    `${fields.address}\n\n` +
    `${fields.statement}\n\n` +
    `URI: ${fields.uri}\n` +
    `Version: ${fields.version}\n` +
    `Chain ID: ${fields.chainId}\n` +
    `Nonce: ${fields.nonce}\n` +
    `Issued At: ${fields.issuedAt}\n` +
    `Expiration Time: ${fields.expirationTime}`;
}

export function getSiweConfig() {
  const domain = process.env.SIWE_DOMAIN || (typeof window === 'undefined' ? 'localhost' : window.location.host);
  const uri = process.env.SIWE_URI || (typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  const version = process.env.SIWE_VERSION || '1';
  const chainId = Number(process.env.SIWE_CHAIN_ID || 1);
  const statement = process.env.SIWE_STATEMENT || 'Sign in to WhisperRNote';
  return { domain, uri, version, chainId, statement };
}
