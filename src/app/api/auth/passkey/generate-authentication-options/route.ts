import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { Client, Users } from 'node-appwrite';
import { setChallengeForEmail } from '../_store';

function getRp(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const rpID = process.env.PASSKEY_RP_ID || host.split(':')[0];
  return { rpID };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rpID } = getRp(request);

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    const list = await users.list();
    const match = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!match) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const prefs: any = match.prefs || {};
    const credId = prefs.passkeyCredentialId as string | undefined;

    // If user exists but has no registered passkey credential, signal client to initiate registration
    if (!credId) {
      return NextResponse.json({ message: 'No passkey credentials found' }, { status: 404 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'required',
      allowCredentials: [{ id: credId, type: 'public-key', transports: ['internal'] }],
    } as any);

    setChallengeForEmail(email, options.challenge);

    return NextResponse.json({ options, userId: match.$id });
  } catch (error: any) {
    console.error('generate-authentication-options error:', error);
    return NextResponse.json({ message: error.message || 'Failed to generate options' }, { status: 500 });
  }
}
