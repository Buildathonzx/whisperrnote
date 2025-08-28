import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse, type VerifiedRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { Client, Users } from 'node-appwrite';

function getRp(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  const rpID = process.env.PASSKEY_RP_ID || host.split(':')[0];
  return { rpID, origin };
}

export async function POST(request: NextRequest) {
  try {
    const { email, attResp, expectedChallenge, userId } = (await request.json()) as {
      email: string;
      attResp: RegistrationResponseJSON;
      expectedChallenge: string; // temporarily passed back until DB persistence is wired
      userId: string;
    };

    if (!email || !attResp || !expectedChallenge || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { rpID, origin } = getRp(request);

    // In production, fetch expected challenge from DB keyed by user/email
    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ message: 'Registration verification failed' }, { status: 400 });
    }

    const { credentialPublicKey, credentialID, counter, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;

    // Persist credential to Appwrite user prefs for now (better: a proper DB collection)
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    await users.updatePrefs(userId, {
      authMethod: 'passkey',
      passkeyCredentialId: Buffer.from(credentialID).toString('base64url'),
      passkeyPublicKeyJwk: Buffer.from(credentialPublicKey).toString('base64url'),
      passkeyCounter: counter,
      passkeyBackedUp: credentialBackedUp,
      passkeyDeviceType: credentialDeviceType,
      passkeyEmail: email,
      registeredAt: new Date().toISOString(),
    } as any);

    // Issue token for immediate login
    const token = await users.createToken(userId);

    return NextResponse.json({
      success: true,
      userId,
      secret: token.secret,
      expire: token.expire,
    });
  } catch (error: any) {
    console.error('verify-registration error:', error);
    return NextResponse.json({ message: error.message || 'Verification failed' }, { status: 500 });
  }
}
