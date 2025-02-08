import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || 'whisperrnote.space'; // Fallback to your main domain
  const path = request.nextUrl.pathname;

  if (hostname === 'whisperrnote.space' || hostname === 'www.whisperrnote.space') {
    return NextResponse.next(); // Let Next.js handle the root domain
  }

  // Handle other subdomains as needed.  Example:
  if (hostname === 'app.whisperrnote.space') {
    return NextResponse.rewrite(new URL(`/notes${path}`, request.url));
  }

  if (hostname === 'auth.whisperrnote.space') {
    return NextResponse.rewrite(new URL(`/login${path}`, request.url));
  }

  if (hostname === 'send.whisperrnote.space') {
    return NextResponse.rewrite(new URL(`/send${path}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
