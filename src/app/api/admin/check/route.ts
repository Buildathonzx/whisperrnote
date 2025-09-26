'use server';
import { NextResponse } from 'next/server';
import { requireFounder as requireAdmin, requireAdminFromRequest } from '@/lib/admin/auth';

export async function GET(req: Request) {
  const res = await requireAdminFromRequest(req);
  if (!res.allowed) {
    return NextResponse.json({ error: res.reason || 'forbidden', prefValue: (res as any).prefValue }, { status: res.reason === 'unauthenticated' ? 401 : 403 });
  }
  return NextResponse.json({ ok: true, userId: res.user?.$id, admin: true });
}
