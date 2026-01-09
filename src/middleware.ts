/**
 * Middleware SIMPLIFIÉ
 * Vérifie UNIQUEMENT l'existence d'un cookie session
 * NE BLOQUE JAMAIS le render SSR
 * La vérification du rôle se fait côté client (AdminShell)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Vérifier la présence d'un cookie de session NextAuth
  const sessionToken = 
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Routes admin : cookie requis (la vérification du rôle se fait côté client)
  if (path.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Routes protégées : cookie requis
  if (path.startsWith('/sessions') || path.match(/^\/session\/[^/]+/)) {
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/sessions',
    '/session/:path*',
  ],
};
