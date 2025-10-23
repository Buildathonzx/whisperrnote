import { NextResponse } from 'next/server';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email, credentialId, name } = await req.json();
    if (!email || !credentialId || !name) {
      return NextResponse.json({ error: 'email, credentialId and name required' }, { status: 400 });
    }

    const server = new PasskeyServer();
    await server.renamePasskey(email.toLowerCase(), credentialId, name);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
