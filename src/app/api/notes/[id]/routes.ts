import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, deleteNote } from '@/lib/notes';

// GET /api/notes/[id] - Get a single note
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const note = await getNote(params.id);
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch note' }, { status: 404 });
  }
}

// PATCH /api/notes/[id] - Update a note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const note = await updateNote(params.id, data);
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update note' }, { status: 400 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteNote(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete note' }, { status: 400 });
  }
}
