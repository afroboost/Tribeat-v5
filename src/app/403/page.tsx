/**
 * Page 403 - Accès Refusé
 * 
 * Affichée quand un utilisateur authentifié tente d'accéder
 * à une route pour laquelle il n'a pas les permissions
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icône */}
        <div className="text-8xl">🚫</div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Accès Refusé
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild data-testid="go-back-button">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" asChild data-testid="contact-support-button">
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </div>

        {/* Note */}
        <div className="pt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.</p>
        </div>
      </div>
    </div>
  );
}
