import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { email, credentialId, publicKey, displayName } = await request.json();

    if (!email || !credentialId || !publicKey) {
      return NextResponse.json(
        { message: 'Missing required fields: email, credentialId, publicKey' },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    // Create or get user by email
    let userId: string;
    try {
      const newUserId = ID.unique();
      const emailUsername = email.split('@')[0];
      const cleanName = (displayName || emailUsername.replace(/[^a-zA-Z]/g, '') || 'User');
      const user = await users.create(
        newUserId,
        email,
        undefined,
        undefined,
        cleanName
      );
      userId = user.$id;
    } catch (createError: any) {
      if (createError?.code === 409) {
        // User already exists - find by email
        const list = await users.list();
        const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) throw new Error('Existing user not found after 409');
        userId = existing.$id;
      } else {
        throw createError;
      }
    }

    // Store passkey credential info in user preferences
    await users.updatePrefs(userId, {
      authMethod: 'passkey',
      passkeyCredentialId: credentialId,
      passkeyPublicKey: publicKey,
      passkeyEmail: email,
      registeredAt: new Date().toISOString(),
    } as any);

    // Create custom token for immediate login
    const token = await users.createToken(userId);

    return NextResponse.json({
      success: true,
      userId,
      secret: token.secret,
      expire: token.expire,
    });
  } catch (error: any) {
    console.error('passkey/register error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
