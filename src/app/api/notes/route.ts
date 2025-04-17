import { NextRequest, NextResponse } from 'next/server';
import { createNote, listNotes } from '@/lib/notes';

// POST /api/notes - Create a new note
export async function POST(req: NextRequest) {
  try {
    const { title, content, userId, isPublic = false, tags = [] } = await req.json();
    const note = await createNote({ title, content, userId, isPublic, tags });
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create note' }, { status: 400 });
  }
}

// GET /api/notes?userId=... - List notes for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    const notes = await listNotes(userId);
    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch notes' }, { status: 400 });
  }
}
