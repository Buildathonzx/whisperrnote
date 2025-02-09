import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, verifyWalletSignature, generateNonce } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { address, signature, action } = await req.json();
    
    if (action === 'getNonce') {
      const nonce = generateNonce();
      // Store nonce in session or temporary storage
      return NextResponse.json({ nonce });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Signature required' }, { status: 400 });
    }

    const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    const isValid = verifyWalletSignature(message, signature, address);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: address
        }
      });
    }

    const token = generateToken(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 400 }
    );
  }
}