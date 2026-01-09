/**
 * Admin Debug Page - DIAGNOSTIC
 * Sans auth, sans DB, rendu brut
 */

export const dynamic = "force-dynamic";

export default function AdminDebugPage() {
  const now = new Date().toISOString();
  
  return (
    <div style={{ padding: 40, backgroundColor: '#fef3c7', border: '3px solid #f59e0b', borderRadius: 8 }}>
      <h1 style={{ color: '#92400e', fontSize: 32, margin: 0 }}>ADMIN DEBUG OK</h1>
      <p style={{ color: '#78350f', fontSize: 18, marginTop: 10 }}>
        Page admin rendue sans auth et sans DB.
      </p>
      <p style={{ color: '#92400e', fontSize: 14, marginTop: 20 }}>
        Timestamp serveur: <strong>{now}</strong>
      </p>
      <div style={{ marginTop: 30, padding: 15, background: '#fff', borderRadius: 4 }}>
        <p style={{ margin: 0, color: '#000' }}>
          ✅ Si tu vois ce message, le rendu Next.js fonctionne correctement.<br/>
          ✅ Le layout admin est chargé.<br/>
          ✅ Le serveur répond.
        </p>
      </div>
    </div>
  );
}
