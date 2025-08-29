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

// Structured logging utility
function logWalletEvent(level: 'info' | 'warn' | 'error', event: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    service: 'wallet-auth',
    endpoint: 'nonce',
    level,
    event,
    ...data
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let addressPreview = 'unknown';

  try {
    const { address } = await request.json();

    // Get client IP for logging (without exposing in responses)
    clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               request.headers.get('x-client-ip') ||
               'unknown';

    // Validate input
    if (!address || typeof address !== 'string') {
      logWalletEvent('warn', 'nonce_request_invalid', {
        clientIP,
        reason: 'missing_address',
        hasAddress: !!address,
        addressType: typeof address
      });
      return NextResponse.json({
        error: 'Wallet address is required. Please ensure your wallet is connected.',
        code: 'MISSING_ADDRESS'
      }, { status: 400 });
    }

    // Create address preview for logging (first 6 + last 4 chars)
    addressPreview = address.length >= 10 ?
      `${address.slice(0, 6)}...${address.slice(-4)}` :
      'invalid_format';

    // Basic rate limiting by IP
    if (!checkRateLimit(clientIP)) {
      logWalletEvent('warn', 'nonce_request_rate_limited', {
        clientIP,
        addressPreview
      });
      return NextResponse.json({
        error: 'Too many requests. Please wait a few minutes before trying again.',
        code: 'RATE_LIMIT_EXCEEDED'
      }, { status: 429 });
    }

    // Validate Ethereum address format
    if (!address.startsWith('0x') || address.length !== 42) {
      logWalletEvent('warn', 'nonce_request_invalid_address', {
        clientIP,
        addressPreview,
        reason: 'invalid_format',
        addressLength: address.length,
        startsWith0x: address.startsWith('0x')
      });
      return NextResponse.json({
        error: 'Invalid wallet address format. Please ensure you are using a valid Ethereum address.',
        code: 'INVALID_ADDRESS_FORMAT'
      }, { status: 400 });
    }

    const { token, payload } = issueNonce(address);
    const statement = process.env.AUTH_STATEMENT || 'Sign in to WhisperRNote';

    const responseTime = Date.now() - startTime;
    logWalletEvent('info', 'nonce_request_success', {
      clientIP,
      addressPreview,
      responseTime: `${responseTime}ms`,
      domain: payload.domain,
      chainId: payload.chainId
    });

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
    const responseTime = Date.now() - startTime;
    logWalletEvent('error', 'nonce_request_error', {
      clientIP,
      addressPreview,
      responseTime: `${responseTime}ms`,
      error: error.message,
      stack: error.stack?.split('\n')[0] // Only log first line of stack
    });

    return NextResponse.json({
      error: 'Unable to prepare wallet authentication. Please try again or contact support if the issue persists.',
      code: 'NONCE_GENERATION_FAILED'
    }, { status: 500 });
  }
}
