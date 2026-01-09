/**
 * Admin Layout - Ghost Access
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

// FORCE DYNAMIC - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // Pas de session → login
  if (!session) {
    redirect('/auth/login?callbackUrl=/admin/dashboard');
  }

  // Pas admin → 403
  if (session.user?.role !== 'SUPER_ADMIN') {
    redirect('/403');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
