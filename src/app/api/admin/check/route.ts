'use server';
import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/auth';

export async function GET(req: Request) {
  const res = await requireAdminFromRequest(req);
  if (!res.allowed) {
    return NextResponse.json({ error: res.reason || 'forbidden' }, { status: res.reason === 'unauthenticated' ? 401 : 403 });
  }
  return NextResponse.json({ ok: true, userId: res.user?.$id, admin: true });
}
