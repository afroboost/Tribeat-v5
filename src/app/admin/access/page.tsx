/**
 * Admin - Gestion des Accès
 */

import { getAccesses } from '@/actions/access';
import { prisma } from '@/lib/prisma';
import { AccessManager } from '@/components/admin/AccessManager';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AccessPage() {
  let accesses: any[] = [];
  let sessions: any[] = [];
  let users: any[] = [];

  try {
    const [accessesResult, sessionsData, usersData] = await Promise.all([
      getAccesses(),
      prisma.session.findMany({
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    accesses = accessesResult.success ? (accessesResult.data as any[]) : [];
    sessions = sessionsData;
    users = usersData;
  } catch (e) {
    console.error('DB Error:', e);
  }

  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>RENDER OK — ACCESS</h1>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Accès</h2>
        <p className="text-gray-500">Gérez les accès des utilisateurs aux sessions</p>
      </div>

      <AccessManager 
        accesses={accesses} 
        sessions={sessions} 
        users={users} 
      />
    </div>
  );
}
