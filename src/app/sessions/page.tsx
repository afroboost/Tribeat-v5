'use client';

/**
 * Sessions Page (SIMPLE)
 * - Affiche l’état connecté
 * - Bouton LOGOUT qui fonctionne
 * - Pas de Prisma
 * - Pas de SSR
 * - Juste pour VALIDER L’AUTH
 */

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SessionsPage() {
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
            Bienvenue, {session.user?.email}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
        >
          Se déconnecter
        </Button>
      </div>

      <div className="border rounded-lg p-10 text-center text-gray-500">
        Aucune session disponible
      </div>
    </div>
  );
}
