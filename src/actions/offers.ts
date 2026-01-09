'use server';

/**
 * Server Actions - Gestion des Offres
 * SÉCURISÉ: Vérification admin dans chaque action critique
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin, logAdminAction } from '@/lib/auth-helpers';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Récupérer toutes les offres (ADMIN ONLY for full list)
 */
export async function getAllOffers(): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error };
  }

  try {
    const offers = await prisma.offer.findMany({
      include: {
        session: { select: { id: true, title: true, status: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: offers };
  } catch (error) {
    console.error('Error fetching offers:', error);
    return { success: false, error: 'Erreur lors de la récupération' };
  }
}

/**
 * Récupérer les offres actives (PUBLIC)
 */
export async function getActiveOffers(): Promise<ActionResult> {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      include: {
        session: { select: { id: true, title: true, status: true, scheduledAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: offers };
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return { success: false, error: 'Erreur' };
  }
}

/**
 * Récupérer une offre par ID (PUBLIC)
 */
export async function getOfferById(offerId: string): Promise<ActionResult> {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        session: { select: { id: true, title: true, description: true, status: true, scheduledAt: true } },
      },
    });
    
    if (!offer) {
      return { success: false, error: 'Offre non trouvée' };
    }

    return { success: true, data: offer };
  } catch (error) {
    console.error('Error fetching offer:', error);
    return { success: false, error: 'Erreur' };
  }
}

/**
 * Créer une offre (ADMIN ONLY)
 */
export async function createOffer(
  name: string,
  price: number,
  currency: string = 'CHF',
  description?: string,
  sessionId?: string
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error };
  }

  try {
    const offer = await prisma.offer.create({
      data: {
        name,
        description: description || null,
        price: Math.round(price * 100), // Convertir en centimes
        currency,
        sessionId: sessionId || null,
        isActive: true,
      },
      include: {
        session: { select: { title: true } },
      },
    });

    logAdminAction('CREATE_OFFER', auth.userId!, {
      offerId: offer.id,
      name,
      price,
    });

    revalidatePath('/admin/payments');
    return { success: true, data: offer };
  } catch (error) {
    console.error('Error creating offer:', error);
    return { success: false, error: 'Erreur lors de la création' };
  }
}

/**
 * Mettre à jour une offre (ADMIN ONLY)
 */
export async function updateOffer(
  offerId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    sessionId?: string | null;
    isActive?: boolean;
  }
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error };
  }

  try {
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Math.round(data.price * 100);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.sessionId !== undefined) updateData.sessionId = data.sessionId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const offer = await prisma.offer.update({
      where: { id: offerId },
      data: updateData,
    });

    logAdminAction('UPDATE_OFFER', auth.userId!, { offerId, changes: data });

    revalidatePath('/admin/payments');
    return { success: true, data: offer };
  } catch (error) {
    console.error('Error updating offer:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * Supprimer une offre (ADMIN ONLY)
 */
export async function deleteOffer(offerId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.isAdmin) {
    return { success: false, error: auth.error };
  }

  try {
    // Vérifier s'il y a des transactions liées
    const transactions = await prisma.transaction.count({
      where: { offerId },
    });

    if (transactions > 0) {
      // Désactiver plutôt que supprimer
      await prisma.offer.update({
        where: { id: offerId },
        data: { isActive: false },
      });
      
      logAdminAction('DEACTIVATE_OFFER', auth.userId!, { offerId, reason: 'has_transactions' });
      
      return { success: true, data: { deactivated: true } };
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    logAdminAction('DELETE_OFFER', auth.userId!, { offerId });

    revalidatePath('/admin/payments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting offer:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
