import { NextRequest, NextResponse } from 'next/server';
import { issueNonce } from '../_nonceStore';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
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
