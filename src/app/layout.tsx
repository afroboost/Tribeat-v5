import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { useSession, signOut } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tribeat - Sessions Live Interactives',
  description: 'Plateforme de sessions live synchronisées',
};

/**
 * UI SIMPLE pour voir l’état de connexion + se déconnecter
 * (aucun impact sur Prisma / Auth existante)
 */
function AuthStatusBar() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div style={{ padding: 8, fontSize: 12 }}>
        ⏳ Vérification de la session…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: 8, fontSize: 12, color: 'red' }}>
        ❌ Non connecté
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 8,
        fontSize: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#111',
        color: 'white',
      }}
    >
      <span>✅ Connecté : {session.user?.email}</span>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          background: '#222',
          color: 'white',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <AuthStatusBar />
            {children}
          </AuthProvider>
        </ErrorBoundary>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
