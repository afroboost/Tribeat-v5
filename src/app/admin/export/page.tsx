/**
 * Page Admin - Export de Données
 */

import { ExportPanel } from '@/components/admin/ExportPanel';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';

export default async function AdminExportPage() {
  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>RENDER OK — EXPORT</h1>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📥 Export de Données</h2>
        <p className="mt-2 text-gray-600">Exportez vos données au format CSV ou JSON.</p>
      </div>

      <ExportPanel />
    </div>
  );
}
