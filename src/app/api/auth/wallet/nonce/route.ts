import { NextRequest, NextResponse } from 'next/server';
import { issueNonce } from '../_nonceStore';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const nonce = issueNonce(address);
    return NextResponse.json({ address: address.toLowerCase(), nonce, expiresIn: 300 });
  } catch (error: any) {
    console.error('wallet/nonce error:', error);
    return NextResponse.json({ error: error.message || 'Failed to issue nonce' }, { status: 500 });
  }
}
