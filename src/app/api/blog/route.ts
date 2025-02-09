import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, author, image } = await req.json();
    const post = await prisma.blogPost.create({
      data: { title, content, author, image }
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}