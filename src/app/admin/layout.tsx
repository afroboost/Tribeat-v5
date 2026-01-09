/**
 * Admin Layout - DEBUG MODE
 * TEMPORAIRE - Sans auth, sans DB, sans redirect
 */

import { ReactNode } from 'react';

// FORCE DYNAMIC
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }: { children: ReactNode }) {
  // DEBUG: Rendu brut sans aucune dépendance
  return (
    <div style={{ padding: 20, backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <div style={{ padding: 15, background: '#d1fae5', border: '2px solid #10b981', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#065f46' }}>ADMIN LAYOUT RENDU</h1>
        <p style={{ margin: '5px 0 0 0', color: '#047857' }}>Si ce texte s'affiche, le layout fonctionne.</p>
      </div>
      {children}
    </div>
  );
}
