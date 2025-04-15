import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { AppwriteClient, Databases } from 'node-appwrite';

const client = new AppwriteClient();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || '')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const database = new Databases(client);

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notes = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID || '',
      process.env.APPWRITE_COLLECTION_ID || '',
      [`equal("userId", "${user.id}")`]
    );

    return NextResponse.json(notes.documents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
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
    const { title, content, tags = [], isPublic = false } = await req.json();

    const note = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID || '',
      process.env.APPWRITE_COLLECTION_ID || '',
      'unique()',
      {
        title,
        content,
        isPublic,
        userId: user.id,
        tags
      }
    );

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 400 }
    );
  }
}