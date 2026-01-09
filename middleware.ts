/**
 * Middleware - Protection des routes
 * Auth centralisée ici, PAS dans les layouts
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protection admin : SUPER_ADMIN uniquement
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), req.url));
      }
      if (token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/403', req.url));
      }
    }

    // Protection coach dashboard
    if (path.startsWith('/coach')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), req.url));
      }
      if (token.role !== 'COACH' && token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/403', req.url));
      }
    }

    // Protection sessions (utilisateur connecté)
    if (path.startsWith('/sessions') || path.startsWith('/session/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Routes publiques - toujours autorisées
        if (
          path === '/' ||
          path.startsWith('/auth') ||
          path.startsWith('/api') ||
          path === '/403'
        ) {
          return true;
        }
        
        // Routes protégées - token requis
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/coach/:path*',
    '/sessions',
    '/session/:path*',
  ],
};
