import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';
import { verifyNonce } from '../_nonceStore';
import { getAddress } from 'viem';
// import { recoverAddress, hashMessage } from 'viem/utils';

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
  try {
    const { email, address, signature, nonceToken } = await request.json();
    if (!address || !signature || !nonceToken) {
      return NextResponse.json({ error: 'Missing required fields: address, signature, nonceToken' }, { status: 400 });
    }

    const payload = verifyNonce(nonceToken);

    // Enforce domain/uri/version/chainId from server config
    const expectedDomain = String(process.env.AUTH_DOMAIN || 'localhost');
    const expectedUri = String(process.env.AUTH_URI || 'http://localhost:3000');
    const expectedVersion = String(process.env.AUTH_SIWE_VERSION || '1');
    const expectedChainId = Number(process.env.AUTH_CHAIN_ID || 1);

    if (payload.domain !== expectedDomain || payload.uri !== expectedUri || payload.version !== expectedVersion || payload.chainId !== expectedChainId) {
      return NextResponse.json({ error: 'Nonce token context mismatch' }, { status: 400 });
    }

    const normalized = payload.addr;
    if (normalized !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Address does not match nonce token' }, { status: 400 });
    }

    const statement = process.env.AUTH_STATEMENT || 'Sign in to WhisperRNote';
    const message = buildSiweMessage({
      domain: payload.domain,
      address: getAddress(address),
      statement,
      uri: payload.uri,
      version: payload.version,
      chainId: payload.chainId,
      nonce: payload.nonce,
      issuedAt: new Date(payload.iat).toISOString(),
      expirationTime: new Date(payload.exp).toISOString(),
    });

    // Recover and compare address
    const recovered = await (async () => {
      // viem expects either a hashed message or use recoverMessageAddress helper
      const { recoverMessageAddress } = await import('viem/utils');
      return await recoverMessageAddress({ message, signature });
    })();
    if (recovered.toLowerCase() !== normalized) {
      return NextResponse.json({ error: 'Signature does not match address' }, { status: 401 });
    }

    // Init Appwrite admin
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    // Identity binding rules (minimal, without DB):
    // 1) If wallet already attached to some user -> prefer that user
    let userId: string | null = null;
    try {
      // CAUTION: users.list() is a stopgap. In production, replace with proper index/search.
      const list = await users.list();
      const found = list.users.find(u => (u.prefs as any)?.walletAddress?.toLowerCase?.() === normalized);
      if (found) userId = found.$id;
    } catch {}

    // 2) Else if email provided
    if (!userId && email) {
      try {
        const list = await users.list();
        const byEmail = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (byEmail) {
          // Do not auto-attach if caller is not authenticated as that email.
          // For now, require explicit attach flow (client-side) or email verification step.
          return NextResponse.json({
            status: 'email_verification_required',
            message: 'Email exists. Verify email to link this wallet.',
          }, { status: 409 });
        }
      } catch {}
    }

    // 3) If still not resolved, create a new user (use email if provided and not taken)
    if (!userId) {
      const newId = ID.unique();
      const name = `eth_${normalized.slice(2, 8)}`;
      const user = email
        ? await users.create(newId, email, undefined, undefined, name)
        : await users.create(newId, undefined as any, undefined, undefined, name);
      userId = user.$id;
    }

    // Attach wallet prefs
    await users.updatePrefs(userId!, {
      walletAddress: normalized,
      walletProvider: 'ethereum',
      lastWalletSignInAt: new Date().toISOString(),
    } as any);

    const token = await users.createToken(userId!);
    return NextResponse.json({ success: true, userId, secret: token.secret, expire: token.expire });
  } catch (error: any) {
    console.error('wallet/verify error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
