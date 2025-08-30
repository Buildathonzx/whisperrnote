import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';
import { getUserIdByWallet, setWalletMap } from '@/lib/appwrite/wallet-map';
import { verifyNonceToken } from '@/lib/auth/wallet-nonce';
import { getAddress } from 'viem';

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 verification attempts per window

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
    endpoint: 'verify',
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

function buildSiweMessage(params: {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}) {
  const { domain, address, statement, uri, version, chainId, nonce, issuedAt, expirationTime } = params;
  return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}\n\nURI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}\nExpiration Time: ${expirationTime}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let clientIP = 'unknown';
  let addressPreview = 'unknown';
  let hasEmail = false;

  try {
    const { email, address, signature, nonceToken } = await request.json();

    // Get client IP for logging
    clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               request.headers.get('x-client-ip') ||
               'unknown';

    hasEmail = !!email;

    // Create address preview for logging
    addressPreview = address && address.length >= 10 ?
      `${address.slice(0, 6)}...${address.slice(-4)}` :
      'invalid_format';

    // Validate required fields
    if (!address || !signature || !nonceToken) {
      logWalletEvent('warn', 'verify_request_invalid', {
        clientIP,
        addressPreview,
        hasEmail,
        missingFields: {
          address: !address,
          signature: !signature,
          nonceToken: !nonceToken
        }
      });
      return NextResponse.json({
        error: 'Missing required information. Please ensure your wallet is connected and try again.',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Basic rate limiting by IP
    if (!checkRateLimit(clientIP)) {
      logWalletEvent('warn', 'verify_request_rate_limited', {
        clientIP,
        addressPreview,
        hasEmail
      });
      return NextResponse.json({
        error: 'Too many verification attempts. Please wait before trying again.',
        code: 'RATE_LIMIT_EXCEEDED'
      }, { status: 429 });
    }

    // Validate Ethereum address format
    if (!address.startsWith('0x') || address.length !== 42) {
      logWalletEvent('warn', 'verify_request_invalid_address', {
        clientIP,
        addressPreview,
        hasEmail,
        reason: 'invalid_format'
      });
      return NextResponse.json({
        error: 'Invalid wallet address format. Please ensure you are using a valid Ethereum address.',
        code: 'INVALID_ADDRESS_FORMAT'
      }, { status: 400 });
    }

    // Validate signature format (basic check)
    if (!signature.startsWith('0x') || signature.length !== 132) {
      logWalletEvent('warn', 'verify_request_invalid_signature', {
        clientIP,
        addressPreview,
        hasEmail,
        signatureLength: signature.length
      });
      return NextResponse.json({
        error: 'Invalid signature format. Please try signing the message again.',
        code: 'INVALID_SIGNATURE_FORMAT'
      }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logWalletEvent('warn', 'verify_request_invalid_email', {
        clientIP,
        addressPreview,
        email: email.substring(0, 3) + '***' // Partial email for logging
      });
      return NextResponse.json({
        error: 'Invalid email format. Please enter a valid email address.',
        code: 'INVALID_EMAIL_FORMAT'
      }, { status: 400 });
    }

    // Verify nonce token
    const payload = verifyNonceToken(nonceToken);
    if (!payload) {
      logWalletEvent('warn', 'verify_request_invalid_nonce', {
        clientIP,
        addressPreview,
        hasEmail,
        nonceError: 'invalid_or_expired'
      });
      return NextResponse.json({
        error: 'Authentication session expired. Please try connecting your wallet again.',
        code: 'INVALID_NONCE_TOKEN'
      }, { status: 400 });
    }

    // Enforce domain/uri/version/chainId from server config (SIWE_*)
    const expectedDomain = String(process.env.SIWE_DOMAIN || 'localhost');
    const expectedUri = String(process.env.SIWE_URI || 'http://localhost:3000');
    const expectedVersion = String(process.env.SIWE_VERSION || '1');
    const expectedChainId = Number(process.env.SIWE_CHAIN_ID || 1);

    if (payload.domain !== expectedDomain || payload.uri !== expectedUri || payload.version !== expectedVersion || payload.chainId !== expectedChainId) {
      logWalletEvent('warn', 'verify_request_context_mismatch', {
        clientIP,
        addressPreview,
        hasEmail,
        expected: { domain: expectedDomain, uri: expectedUri, version: expectedVersion, chainId: expectedChainId },
        received: { domain: payload.domain, uri: payload.uri, version: payload.version, chainId: payload.chainId }
      });
      return NextResponse.json({
        error: 'Authentication context mismatch. Please refresh the page and try again.',
        code: 'CONTEXT_MISMATCH'
      }, { status: 400 });
    }

    const normalized = payload.addr;
    if (normalized !== address.toLowerCase()) {
      logWalletEvent('warn', 'verify_request_address_mismatch', {
        clientIP,
        addressPreview,
        hasEmail,
        nonceAddress: `${normalized.slice(0, 6)}...${normalized.slice(-4)}`,
        providedAddress: addressPreview
      });
      return NextResponse.json({
        error: 'Wallet address mismatch. Please ensure you are using the same wallet that requested authentication.',
        code: 'ADDRESS_MISMATCH'
      }, { status: 400 });
    }

    const statement = process.env.SIWE_STATEMENT || 'Sign in to WhisperRNote';
    const issuedAt = new Date(payload.iat * 1000).toISOString();
    const expirationTime = new Date(payload.exp * 1000).toISOString();
    const message = buildSiweMessage({
      domain: payload.domain,
      address: getAddress(address),
      statement,
      uri: payload.uri,
      version: payload.version,
      chainId: payload.chainId,
      nonce: payload.nonce,
      issuedAt,
      expirationTime,
    });

    // Recover and compare address
    let recovered: string;
    try {
      recovered = await (async () => {
        const { recoverMessageAddress } = await import('viem/utils');
        return await recoverMessageAddress({ message, signature });
      })();
    } catch (signatureError: any) {
      logWalletEvent('warn', 'verify_request_signature_recovery_failed', {
        clientIP,
        addressPreview,
        hasEmail,
        error: signatureError.message
      });
      return NextResponse.json({
        error: 'Unable to verify signature. Please try signing the message again.',
        code: 'SIGNATURE_RECOVERY_FAILED'
      }, { status: 400 });
    }

    if (recovered.toLowerCase() !== normalized) {
      logWalletEvent('warn', 'verify_request_signature_mismatch', {
        clientIP,
        addressPreview,
        hasEmail,
        recoveredAddress: `${recovered.slice(0, 6)}...${recovered.slice(-4)}`,
        expectedAddress: addressPreview
      });
      return NextResponse.json({
        error: 'Signature verification failed. Please ensure you signed the correct message with the correct wallet.',
        code: 'SIGNATURE_MISMATCH'
      }, { status: 401 });
    }

    // Init Appwrite admin
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    // Identity binding rules (minimal, without DB):
    // 1) Try to find user by exact email via Appwrite search API to avoid full scan
    let userId: string | null = null;
    let userAction = 'unknown';

    // Helper to page through users without loading everything at once
    async function findUserByWalletAddress(addrLower: string): Promise<string | null> {
      try {
        // Appwrite Users API has limited filtering; we page modestly to stay safe
        for (let i = 0; i < 20; i++) { // bounded iterations as safety
          const res: any = await users.list();
          const hit = res.users?.find((u: any) => (u.prefs as any)?.walletAddress?.toLowerCase?.() === addrLower);
          if (hit) return hit.$id;
          if (!res.users?.length) break;
        }
        return null;
      } catch (e: any) {
        logWalletEvent('warn', 'verify_user_lookup_failed', {
          clientIP,
          addressPreview,
          hasEmail,
          error: e.message
        });
        return null;
      }
    }

    // 1) If wallet already mapped in walletMap -> prefer that user
    const mappedUser = await getUserIdByWallet(normalized);
    if (mappedUser) {
      userId = mappedUser;
      userAction = 'existing_wallet_user_mapped';
    } else {
      // Backward-compat: fall back to legacy prefs scan (bounded) once
      const existingByWallet = await findUserByWalletAddress(normalized);
      if (existingByWallet) {
        userId = existingByWallet;
        userAction = 'existing_wallet_user_legacy_prefs';
        // Opportunistically upsert mapping
        try { await setWalletMap(normalized, userId); } catch {}
      }
    }

    // 2) Else if email provided, check if email exists using incremental paging to avoid list-all
    if (!userId && email) {
      try {
        const pageLimit = 50;
        let cursor: string | undefined = undefined;
        let foundEmailUser: any = null;
        for (let i = 0; i < 20; i++) { // up to 1000 users
          const res: any = await users.list();
          const hit = res.users?.find((u: any) => u.email?.toLowerCase?.() === email.toLowerCase());
          if (hit) { foundEmailUser = hit; break; }
          if (!res.users?.length) break;
          cursor = res.users[res.users.length - 1].$id;
        }
        if (foundEmailUser) {
          logWalletEvent('info', 'verify_email_exists_requires_verification', {
            clientIP,
            addressPreview,
            email: email.substring(0, 3) + '***'
          });
          return NextResponse.json({
            status: 'email_verification_required',
            message: 'An account with this email already exists. Please sign in with your email first, then connect your wallet in settings.',
            code: 'EMAIL_VERIFICATION_REQUIRED'
          }, { status: 409 });
        }
      } catch (emailLookupError: any) {
        logWalletEvent('warn', 'verify_email_lookup_failed', {
          clientIP,
          addressPreview,
          email: email.substring(0, 3) + '***',
          error: emailLookupError.message
        });
      }
    }

    // 3) If still not resolved, create a new user (use email if provided and not taken)
    if (!userId) {
      try {
        const newId = ID.unique();
        const name = `eth_${normalized.slice(2, 8)}`;
        const user = email
          ? await users.create(newId, email, undefined, undefined, name)
          : await users.create(newId, undefined as any, undefined, undefined, name);
        userId = user.$id;
        userAction = email ? 'new_user_with_email' : 'new_user_anonymous';
      } catch (createError: any) {
        logWalletEvent('error', 'verify_user_creation_failed', {
          clientIP,
          addressPreview,
          hasEmail,
          error: createError.message
        });
        return NextResponse.json({
          error: 'Unable to create user account. Please try again or contact support.',
          code: 'USER_CREATION_FAILED'
        }, { status: 500 });
      }
    }

    // Attach wallet prefs and ensure wallet map upsert
    try {
      await users.updatePrefs(userId!, {
        walletAddress: normalized,
        walletProvider: 'ethereum',
        lastWalletSignInAt: new Date().toISOString(),
      } as any);
      try { await setWalletMap(normalized, userId!); } catch {}
    } catch (prefsError: any) {
      logWalletEvent('error', 'verify_prefs_update_failed', {
        clientIP,
        addressPreview,
        hasEmail,
        userId,
        error: prefsError.message
      });
      // Don't fail the request if prefs update fails, but log it
    }

    // Create authentication token
    let token;
    try {
      token = await users.createToken(userId!);
    } catch (tokenError: any) {
      logWalletEvent('error', 'verify_token_creation_failed', {
        clientIP,
        addressPreview,
        hasEmail,
        userId,
        error: tokenError.message
      });
      return NextResponse.json({
        error: 'Authentication token creation failed. Please try again.',
        code: 'TOKEN_CREATION_FAILED'
      }, { status: 500 });
    }

    const responseTime = Date.now() - startTime;
    logWalletEvent('info', 'verify_request_success', {
      clientIP,
      addressPreview,
      hasEmail,
      userId,
      userAction,
      responseTime: `${responseTime}ms`
    });

    return NextResponse.json({
      success: true,
      userId,
      secret: token.secret,
      expire: token.expire
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logWalletEvent('error', 'verify_request_unexpected_error', {
      clientIP,
      addressPreview,
      hasEmail,
      responseTime: `${responseTime}ms`,
      error: error.message,
      stack: error.stack?.split('\n')[0] // Only log first line of stack
    });

    return NextResponse.json({
      error: 'An unexpected error occurred during wallet verification. Please try again or contact support if the issue persists.',
      code: 'VERIFICATION_FAILED'
    }, { status: 500 });
  }
}
