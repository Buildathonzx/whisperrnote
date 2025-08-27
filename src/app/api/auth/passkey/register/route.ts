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
    const user = await users.create(
      userId,
      email,
      undefined, // phone
      undefined, // password
      cleanName || 'User' // Use sanitized email username as display name
    );

    console.log('User created successfully:', user.$id);

    // Store passkey credential info in user preferences
    await users.updatePrefs(userId, {
      authMethod: 'passkey',
      passkeyCredentialId: credentialId,
      passkeyPublicKey: publicKey,
      registeredAt: new Date().toISOString()
    });

    console.log('User preferences updated');

    // Create custom token for immediate login
    const token = await users.createToken(userId);

    console.log('Token created successfully');

    return NextResponse.json({
      success: true,
      userId: user.$id,
      secret: token.secret,
      expire: token.expire
    });

  } catch (error: any) {
    console.error('Passkey registration error:', error);
    console.error('Error details:', {
      code: error.code,
      type: error.type,
      message: error.message,
      response: error.response
    });
    
    // Handle user already exists error
    if (error.code === 409) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}