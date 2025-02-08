import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await prisma.note.findFirst({
    where: {
      id: params.noteId,
      OR: [
        { userId: user.id },
        { isPublic: true }
      ]
    },
    include: { tags: true }
  });

  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: params.noteId }
  });

  if (!note || note.userId !== user.id) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  try {
    const { title, content, tags = [], isPublic } = await req.json();

    const updatedNote = await prisma.note.update({
      where: { id: params.noteId },
      data: {
        title,
        content,
        isPublic,
        tags: {
          set: [], // Clear existing tags
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: { tags: true }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: params.noteId }
  });

  if (!note || note.userId !== user.id) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  await prisma.note.delete({
    where: { id: params.noteId }
  });

  return NextResponse.json({ success: true });
}