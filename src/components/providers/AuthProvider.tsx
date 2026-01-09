/**
 * Auth Provider Component
 * Wrapper SessionProvider pour accès session côté client
 * 
 * NOTE: basePath="/nextauth" car /api/* est intercepté par le proxy Kubernetes
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath="/nextauth">
      {children}
    </SessionProvider>
  );
}
