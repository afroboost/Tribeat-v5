/**
 * Checkout Cancel Page
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-yellow-500" />
          <CardTitle className="mt-4">Paiement annulé</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Vous avez annulé le paiement. Aucun montant n'a été débité.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sessions">
              <Button>Voir les offres</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Accueil</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
