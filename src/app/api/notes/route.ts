import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, tags = [], isPublic = false } = await req.json();
    
    const note = await prisma.note.create({
      data: {
        title,
        content,
        isPublic,
        userId: user.id,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: { tags: true }
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 400 }
    );
  }
}