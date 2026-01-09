/**
 * Server Actions - UI Settings
 * 
 * Sécurité Production :
 * - SUPER_ADMIN uniquement
 * - Validation Zod côté serveur
 * - Mutations DB sécurisées
 * - Revalidation cache Next.js
 * 
 * Ces actions permettent au Super Admin de modifier
 * le thème et la configuration PWA en temps réel
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isSuperAdmin } from '@/lib/auth';
import { z } from 'zod';
import { SettingCategory } from '@prisma/client';

// ========================================
// VALIDATION
// ========================================

const uiSettingSchema = z.object({
  key: z.string().min(1, 'Key required'),
  value: z.string().min(1, 'Value required'),
  category: z.enum(['THEME', 'PWA', 'GENERAL']),
});

// ========================================
// READ
// ========================================

/**
 * Récupère tous les UI_Settings
 */
export async function getAllUISettings() {
  try {
    const settings = await prisma.uI_Settings.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error fetching UI settings:', error);
    return { success: false, error: 'Erreur lors de la récupération des paramètres' };
  }
}

/**
 * Récupère les settings par catégorie
 */
export async function getUISettingsByCategory(category: SettingCategory) {
  try {
    const settings = await prisma.uI_Settings.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
    return { success: true, data: settings };
  } catch (error) {
    console.error('Error fetching UI settings by category:', error);
    return { success: false, error: 'Erreur lors de la récupération' };
  }
}

/**
 * Récupère un setting par key
 */
export async function getUISettingByKey(key: string) {
  try {
    const setting = await prisma.uI_Settings.findUnique({
      where: { key },
    });
    return { success: true, data: setting };
  } catch (error) {
    console.error('Error fetching UI setting:', error);
    return { success: false, error: 'Paramètre introuvable' };
  }
}

// ========================================
// CREATE / UPDATE
// ========================================

/**
 * Crée ou met à jour un UI_Setting
 * SUPER_ADMIN uniquement
 */
export async function upsertUISetting(data: z.infer<typeof uiSettingSchema>) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    // Validation
    const validatedData = uiSettingSchema.parse(data);

    // Upsert DB
    const setting = await prisma.uI_Settings.upsert({
      where: { key: validatedData.key },
      update: {
        value: validatedData.value,
        category: validatedData.category,
      },
      create: validatedData,
    });

    // Revalidation cache Next.js - force reload du layout pour les couleurs
    revalidatePath('/', 'layout');
    revalidatePath('/admin/theme');
    revalidatePath('/admin');

    return { success: true, data: setting };
  } catch (error) {
    console.error('Error upserting UI setting:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Données invalides' };
    }
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}

/**
 * Met à jour plusieurs settings en batch
 * SUPER_ADMIN uniquement
 */
export async function batchUpdateUISettings(
  settings: Array<{ key: string; value: string; category: SettingCategory }>
) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    // Update batch avec transaction
    await prisma.$transaction(
      settings.map((setting) =>
        prisma.uI_Settings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        })
      )
    );

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/theme');

    return { success: true };
  } catch (error) {
    console.error('Error batch updating UI settings:', error);
    return { success: false, error: 'Erreur lors de la mise à jour groupée' };
  }
}

// ========================================
// DELETE
// ========================================

/**
 * Supprime un UI_Setting
 * SUPER_ADMIN uniquement
 */
export async function deleteUISetting(key: string) {
  try {
    // Sécurité : Vérification SUPER_ADMIN
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return { success: false, error: 'Non autorisé' };
    }

    await prisma.uI_Settings.delete({
      where: { key },
    });

    // Revalidation cache
    revalidatePath('/');
    revalidatePath('/admin/theme');

    return { success: true };
  } catch (error) {
    console.error('Error deleting UI setting:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
