'use server';
import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin/auth';
import { sendAdminEmail } from '@/lib/admin/messaging';

export async function POST(req: Request) {
  try {
    const gate = await requireFounder();
    if (!gate.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    const { subject, bodyHtml, bodyText, userIds, emails, bcc, allUsers, topic } = body || {};
    const result = await sendAdminEmail({ subject, bodyHtml, bodyText, userIds, emails, bcc, allUsers, topic });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send' }, { status: 400 });
  }
}
