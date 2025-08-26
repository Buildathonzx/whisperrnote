import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { userId, expire = 900, length = 6 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize server client with API key
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(client);

    // Create custom token
    const token = await users.createToken(userId, length, expire);

    return NextResponse.json({
      secret: token.secret,
      expire: token.expire,
      userId: userId
    });

  } catch (error: any) {
    console.error('Token creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Token creation failed' },
      { status: 500 }
    );
  }
}