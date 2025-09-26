'use server';
import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin/auth';

export async function GET() {
  const res = await requireFounder();
  if (!res.allowed) {
    return NextResponse.json({ error: res.reason || 'forbidden' }, { status: res.reason === 'unauthenticated' ? 401 : 403 });
  }
  return NextResponse.json({ ok: true, userId: res.user?.$id });
}
