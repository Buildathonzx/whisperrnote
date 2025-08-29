import { NextRequest, NextResponse } from 'next/server';
import { issueNonce } from '../_nonceStore';

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 requests per window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Basic rate limiting by IP
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Validate Ethereum address format
    if (!address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 });
    }

    const { token, payload } = issueNonce(address);
    const statement = process.env.AUTH_STATEMENT || 'Sign in to WhisperRNote';
    return NextResponse.json({
      address: payload.addr,
      nonceToken: token,
      domain: payload.domain,
      uri: payload.uri,
      version: payload.version,
      chainId: payload.chainId,
      statement,
      issuedAt: new Date(payload.iat).toISOString(),
      expirationTime: new Date(payload.exp).toISOString(),
      // Legacy field for backward compatibility (not used by verify anymore)
      nonce: payload.nonce,
      expiresIn: Math.max(0, Math.floor((payload.exp - Date.now()) / 1000)),
    });
  } catch (error: any) {
    console.error('wallet/nonce error:', error);
    return NextResponse.json({ error: error.message || 'Failed to issue nonce' }, { status: 500 });
  }
}
