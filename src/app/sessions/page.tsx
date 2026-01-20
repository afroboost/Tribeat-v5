'use client';

/**
 * Sessions Page — VERSION SIMPLE ET CORRECTE
 * - Bouton ACCUEIL supprimé
 * - VRAI bouton SE DÉCONNECTER
 */

import { Suspense } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

function SessionsContent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p className="p-6">Chargement…</p>;
  }

  if (!session) {
    return <p className="p-6">Non connecté</p>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-gray-500">
            Connecté : {session.user?.email}
          </p>
        </div>

        {/* 🔴 LE SEUL BOUTON AUTORISÉ */}
        <Button
          variant="destructive"
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: '/login',
            })
          }
        >
          Se déconnecter
        </Button>
      </div>

      <div className="border rounded-lg p-10 text-center text-gray-500">
        Liste des sessions
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<p className="p-6">Chargement…</p>}>
        <SessionsContent />
      </Suspense>
    </SessionProvider>
  );
}
