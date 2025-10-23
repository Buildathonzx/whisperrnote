import { NextResponse } from 'next/server';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email, credentialId } = await req.json();
    if (!email || !credentialId) {
      return NextResponse.json({ error: 'email and credentialId required' }, { status: 400 });
    }

    const server = new PasskeyServer();
    await server.deletePasskey(email.toLowerCase(), credentialId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
