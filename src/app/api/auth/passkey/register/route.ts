import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      credentialId, 
      publicKey 
    } = await request.json();

    console.log('Passkey registration request:', { email, credentialId: !!credentialId, publicKey: !!publicKey });

    if (!email || !credentialId) {
      return NextResponse.json(
        { message: 'Missing required fields: email, credentialId' },
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

    console.log('Creating Appwrite user:', { userId, email, name: cleanName || 'User' });

    // Create user account
    let user;
try {
  user = await users.create(
    userId,
    email,
    undefined,
    undefined,
    cleanName || 'User'
  );
} catch (createError: any) {
  if (createError.code === 409) {
    // User already exists, get by email
    const list = await users.list();
    user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User creation failed and could not retrieve existing user: ' + createError.message);
  } else {
    throw createError;
  }
}

    console.log('User created successfully:', user.$id);

    // Store passkey credential info in user preferences
    await users.updatePrefs(user.$id, {
  authMethod: 'passkey',
  passkeyCredentialId: credentialId,
  passkeyPublicKey: publicKey,
  registeredAt: new Date().toISOString()
});

    console.log('User preferences updated');

    // Create custom token for immediate login
const token = await users.createToken(user.$id);

    return NextResponse.json({
      message: error.message || 'Registration failed',
      details: {
        code: error.code,
        type: error.type,
        response: error.response
      }
    },
    { status: 500 }
    );
    }

    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}