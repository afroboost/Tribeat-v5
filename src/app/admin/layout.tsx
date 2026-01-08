/**
 * Admin Layout Next.js
 * Layout automatique pour toutes les pages /admin/*
 */

import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Double sécurité : vérification serveur
  const session = await getAuthSession();

  // DEBUG LOGS
  console.log('========== ADMIN LAYOUT DEBUG ==========');
  console.log('Session:', JSON.stringify(session, null, 2));
  console.log('User:', session?.user);
  console.log('Role:', session?.user?.role);
  console.log('Is SUPER_ADMIN?', session?.user?.role === 'SUPER_ADMIN');
  console.log('=======================================');

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    console.log('❌ REDIRECT TO /403 - Not authorized');
    redirect('/403');
  }

  console.log('✅ SUPER_ADMIN AUTHORIZED - Rendering admin layout');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader user={session.user} />

        {/* Content - RENDU DES CHILDREN */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
