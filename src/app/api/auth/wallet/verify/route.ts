import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';
import { getNonce, markNonceUsed } from '../_nonceStore';
import { verifyMessage, getAddress, recoverAddress } from 'viem';

function siweMessage(domain: string, address: string, uri: string, nonce: string): string {
  // Minimal SIWE-like message
  // You can extend with chainId, statement, and timestamp if desired
  return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nURI: ${uri}\nNonce: ${nonce}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, address, signature } = await request.json();
    if (!email || !address || !signature) {
      return NextResponse.json({ error: 'Missing required fields: email, address, signature' }, { status: 400 });
    }

    const normalized = address.toLowerCase();
    const nonceRec = getNonce(normalized);
    if (!nonceRec) {
      return NextResponse.json({ error: 'Nonce missing or expired' }, { status: 400 });
    }

    // Build expected SIWE-like message
    const host = request.headers.get('host') || 'localhost';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const domain = host.split(':')[0];
    const uri = `${proto}://${host}`;
    const message = siweMessage(domain, getAddress(normalized), uri, nonceRec.nonce);

    // Verify signature -> recover address must match
    const recovered = await recoverAddress({ message, signature });
    if (recovered.toLowerCase() !== normalized) {
      return NextResponse.json({ error: 'Signature does not match address' }, { status: 401 });
    }

    markNonceUsed(normalized);

    // Initialize Appwrite admin client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    // Find existing user by email, or create one
    let userId: string | null = null;
    try {
      const list = await users.list();
      const match = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (match) userId = match.$id;
    } catch {}

    if (!userId) {
      const newId = ID.unique();
      const emailUsername = email.split('@')[0];
      const cleanName = emailUsername.replace(/[^a-zA-Z]/g, '') || 'User';
      const user = await users.create(newId, email, undefined, undefined, cleanName);
      userId = user.$id;
    }

    // Store wallet info
    await users.updatePrefs(userId!, {
      authMethod: 'wallet',
      walletAddress: normalized,
      walletProvider: 'ethereum',
      registeredAt: new Date().toISOString(),
      lastWalletSignInAt: new Date().toISOString(),
    } as any);

    // Issue custom token and return
    const token = await users.createToken(userId!);
    return NextResponse.json({ success: true, userId, secret: token.secret, expire: token.expire });
  } catch (error: any) {
    console.error('wallet/verify error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
