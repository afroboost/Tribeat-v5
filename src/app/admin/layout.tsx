/**
 * Admin Layout Next.js
 * DEBUG MODE - TOUTES PROTECTIONS DÉSACTIVÉES
 */

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  console.log('========== ADMIN LAYOUT RENDERED ==========');
  
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        ADMIN LAYOUT OK - DEBUG MODE
      </h1>
      <div className="bg-white p-4 rounded">
        {children}
      </div>
    </div>
  );
}
