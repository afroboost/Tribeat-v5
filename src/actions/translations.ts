/**
 * Server Actions - Translations
 * 
 * Sécurité Production :
 * - SUPER_ADMIN uniquement
 * - Validation Zod
 * - Gestion i18n FR/EN/DE
 * - Revalidation cache
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isSuperAdmin } from '@/lib/auth';
import { z } from 'zod';
import { Language } from '@prisma/client';

// ========================================
// VALIDATION
// ========================================

const translationSchema = z.object({
  key: z.string().min(1, 'Key required'),
  language: z.enum(['FR', 'EN', 'DE']),
  value: z.string().min(1, 'Value required'),
});

// ========================================
// READ
// ========================================

/**
 * Récupère toutes les traductions
 */
export async function getAllTranslations() {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: [{ key: 'asc' }, { language: 'asc' }],
    });
    return { success: true, data: translations };
  } catch (error) {
    console.error('Error fetching translations:', error);
    return { success: false, error: 'Erreur lors de la récupération' };
  }
}

/**
 * Récupère les traductions par langue
 */
export async function getTranslationsByLanguage(language: Language) {
  try {
    const translations = await prisma.translation.findMany({
      where: { language },
      orderBy: { key: 'asc' },
    });
    return { success: true, data: translations };
  } catch (error) {
    console.error('Error fetching translations by language:', error);
    return { success: false, error: 'Erreur lors de la récupération' };
  }
}

/**
 * Récupère toutes les clés uniques de traduction
 */
export async function getTranslationKeys() {
  try {
    const keys = await prisma.translation.findMany({
      distinct: ['key'],
      select: { key: true },
      orderBy: { key: 'asc' },
    });
    return { success: true, data: keys.map((k) => k.key) };
  } catch (error) {
    console.error('Error fetching translation keys:', error);
    return { success: false, error: 'Erreur lors de la récupération' };
  }
}

// ========================================
// CREATE / UPDATE
// ========================================

/**
 * Crée ou met à jour une traduction
 * SUPER_ADMIN uniquement
 */
export async function upsertTranslation(data: z.infer<typeof translationSchema>) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    // Validation
    const validatedData = translationSchema.parse(data);

    // Upsert DB
    const translation = await prisma.translation.upsert({
      where: {
        key_language: {
          key: validatedData.key,
          language: validatedData.language,
        },
      },
      update: { value: validatedData.value },
      create: validatedData,
    });

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/translations');

    return { success: true, data: translation };
  } catch (error) {
    console.error('Error upserting translation:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Données invalides' };
    }
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}

/**
 * Met à jour plusieurs traductions en batch
 * SUPER_ADMIN uniquement
 */
export async function batchUpdateTranslations(
  translations: Array<{ key: string; language: Language; value: string }>
) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    // Update batch avec transaction
    await prisma.$transaction(
      translations.map((translation) =>
        prisma.translation.upsert({
          where: {
            key_language: {
              key: translation.key,
              language: translation.language,
            },
          },
          update: { value: translation.value },
          create: translation,
        })
      )
    );

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/translations');

    return { success: true };
  } catch (error) {
    console.error('Error batch updating translations:', error);
    return { success: false, error: 'Erreur lors de la mise à jour groupée' };
  }
}

// ========================================
// DELETE
// ========================================

/**
 * Supprime une traduction
 * SUPER_ADMIN uniquement
 */
export async function deleteTranslation(key: string, language: Language) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    await prisma.translation.delete({
      where: {
        key_language: { key, language },
      },
    });

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/translations');

    return { success: true };
  } catch (error) {
    console.error('Error deleting translation:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}

/**
 * Supprime toutes les traductions d'une clé (FR/EN/DE)
 * SUPER_ADMIN uniquement
 */
export async function deleteTranslationKey(key: string) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    await prisma.translation.deleteMany({
      where: { key },
    });

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/translations');

    return { success: true };
  } catch (error) {
    console.error('Error deleting translation key:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
