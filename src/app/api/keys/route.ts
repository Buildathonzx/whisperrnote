import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { AppwriteClient, Databases } from 'node-appwrite';

const client = new AppwriteClient();
client.setEndpoint(process.env.APPWRITE_ENDPOINT || '');
client.setProject(process.env.APPWRITE_PROJECT_ID || '');
client.setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || '',
      process.env.APPWRITE_COLLECTION_ID || '',
      [`equal("userId", "${user.id}")`]
    );

    const apiKeys = response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
      createdAt: doc.$createdAt,
      lastUsed: doc.lastUsed,
      expiresAt: doc.expiresAt
    }));

    return NextResponse.json(apiKeys);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, expiresAt } = await req.json();

    const key = crypto.randomBytes(32).toString('base64url');

    const response = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || '',
      process.env.APPWRITE_COLLECTION_ID || '',
      crypto.randomUUID(),
      {
        key,
        name,
        userId: user.id,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      }
    );

    const apiKey = {
      id: response.$id,
      key: response.key,
      name: response.name,
      createdAt: response.$createdAt,
      expiresAt: response.expiresAt
    };

    return NextResponse.json(apiKey);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 400 }
    );
  }
}