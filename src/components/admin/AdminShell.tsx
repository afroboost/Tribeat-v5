'use client';

/**
 * AdminShell - Composant CLIENT
 * Charge l'auth côté client (progressive enhancement)
 * Le HTML se render TOUJOURS, l'auth décide du contenu après
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminSkeleton } from './AdminSkeleton';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirection côté client si pas admin
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard');
    } else if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/403');
    }
  }, [status, session, router]);

  // Loading state
  if (status === 'loading') {
    return <AdminSkeleton />;
  }

  // Non authentifié - le useEffect va rediriger
  if (status === 'unauthenticated') {
    return <AdminSkeleton message="Redirection vers la connexion..." />;
  }

  // Pas admin - le useEffect va rediriger
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return <AdminSkeleton message="Accès non autorisé..." />;
  }

  // Admin OK - render complet
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
