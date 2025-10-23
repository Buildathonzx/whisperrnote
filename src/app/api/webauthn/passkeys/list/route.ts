import { NextResponse } from 'next/server';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const server = new PasskeyServer();
    const passkeys = await server.listPasskeysWithMetadata(email.toLowerCase());
    
    return NextResponse.json({ passkeys });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
