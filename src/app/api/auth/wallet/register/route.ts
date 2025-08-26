import { NextRequest, NextResponse } from 'next/server';
import { Client, Users } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      address, 
      provider, 
      chainId, 
      signature 
    } = await request.json();

    if (!userId || !address || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, address, signature' },
        { status: 400 }
      );
    }

    // Initialize server client with API key
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    // Create user account with wallet address as name
    const user = await users.create(
      userId,
      `${address}@wallet.local`, // Use wallet address as email-like identifier
      undefined, // phone
      undefined, // password (not used for wallet auth)
      `Wallet ${address.slice(0, 6)}...${address.slice(-4)}` // Display name
    );

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
    console.error('Wallet registration error:', error);
    
    // Handle user already exists error
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'Wallet already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}