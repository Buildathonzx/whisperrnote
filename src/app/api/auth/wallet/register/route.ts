import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    }
    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY is not set');
    }

    const { 
      userId, 
      email,
      address, 
      provider, 
      chainId, 
      signature 
    } = await request.json();

    console.log('Wallet registration request:', {
      userId,
      email,
      address: address?.toLowerCase(),
      provider,
      chainId,
      hasSignature: !!signature
    });

    if (!userId || !email || !address || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, address, signature' },
        { status: 400 }
      );
    }

    // Initialize server client with API key
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    let user;
    
    try {
      // Try to create user account with real email
      user = await users.create(
        userId,
        email, // Use the provided email
        undefined, // phone
        undefined, // password (not used for wallet auth)
        `Wallet ${address.slice(0, 6)}...${address.slice(-4)}` // Display name
      );
    } catch (createError: any) {
      console.error('User creation failed:', {
        message: createError.message,
        code: createError.code,
        type: createError.type,
        userId,
        address: address.toLowerCase()
      });
      
      // If user already exists, try to get the existing user
      if (createError.code === 409) {
        try {
          user = await users.get(userId);
          console.log('User already exists, using existing user:', user.$id);
        } catch (getError: any) {
          console.error('Failed to get existing user:', getError);
          throw new Error(`User creation failed and could not retrieve existing user: ${createError.message}`);
        }
      } else {
        throw createError;
      }
    }

    // Store wallet info in user preferences
    await users.updatePrefs(userId, {
      authMethod: 'wallet',
      walletAddress: address.toLowerCase(),
      walletProvider: provider,
      chainId: chainId || null,
      signature,
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
    console.error('Wallet registration error - Full details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
      stack: error.stack,
      fullError: error
    });
    
    // Handle user already exists error
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'Wallet already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Registration failed',
        details: {
          code: error.code,
          type: error.type
        }
      },
      { status: 500 }
    );
  }
}