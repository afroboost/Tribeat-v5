/**
 * Middleware DÉSACTIVÉ TEMPORAIREMENT
 * Pour debug login
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // BYPASS TOTAL - Debug login
  console.log('[MIDDLEWARE] Path:', request.nextUrl.pathname);
  console.log('[MIDDLEWARE] Cookies:', request.cookies.getAll().map(c => c.name));
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/sessions',
    '/session/:path*',
  ],
};
