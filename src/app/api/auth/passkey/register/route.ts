import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      displayName, 
      credentialId, 
      publicKey 
    } = await request.json();

    if (!email || !credentialId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, credentialId' },
        { status: 400 }
      );
    }

    // Generate proper Appwrite userId
    const userId = ID.unique();
    
    // Create clean display name from email (before @, sanitized)
    const emailUsername = email.split('@')[0];
    const cleanName = emailUsername.replace(/[^a-zA-Z]/g, ''); // Remove numbers and special chars

    // Initialize server client with API key
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    // Create user account
    const user = await users.create(
      userId,
      email,
      undefined, // phone
      undefined, // password
      cleanName || 'User' // Use sanitized email username as display name
    );

    // Store passkey credential info in user preferences
    await users.updatePrefs(userId, {
      authMethod: 'passkey',
      passkeyCredentialId: credentialId,
      passkeyPublicKey: publicKey,
      registeredAt: new Date().toISOString()
    });

    // Create custom token for immediate login
    const token = await users.createToken(userId, 6, 900); // 15 minutes

    return NextResponse.json({
      success: true,
      userId: user.$id,
      secret: token.secret,
      expire: token.expire
    });

  } catch (error: any) {
    console.error('Passkey registration error:', error);
    
    // Handle user already exists error
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}