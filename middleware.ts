import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || 'whisperrnote.space';
  const { pathname } = request.nextUrl;

  // Root domain: no rewrites
  if (hostname === 'whisperrnote.space' || hostname === 'www.whisperrnote.space') {
    return NextResponse.next();
  }

  // App subdomain: only rewrite root to /notes to avoid loops
  if (hostname === 'app.whisperrnote.space') {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/notes', request.url));
    }
    // Do not prefix all paths with /notes to avoid recursive rewrites
    return NextResponse.next();
  }

  // Auth subdomain: only rewrite root to /login (guard against loops)
  if (hostname === 'auth.whisperrnote.space') {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Send subdomain: only rewrite root to /send (guard against loops)
  if (hostname === 'send.whisperrnote.space') {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/send', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next internals and API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
