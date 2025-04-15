import { NextRequest, NextResponse } from 'next/server';
import { Appwrite } from 'node-appwrite';

const client = new Appwrite();
client.setEndpoint('https://[YOUR_APPWRITE_ENDPOINT]').setProject('[YOUR_PROJECT_ID]');

export async function GET(req: NextRequest) {
  try {
    const database = client.database;
    const posts = await database.listDocuments('[YOUR_COLLECTION_ID]');
    return NextResponse.json(posts.documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, author, image } = await req.json();
    const database = client.database;
    const post = await database.createDocument('[YOUR_COLLECTION_ID]', {
      title,
      content,
      author,
      image
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}