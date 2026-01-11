import '../globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {/* BARRE ADMIN ULTRA SIMPLE */}
        <div
          style={{
            padding: '12px',
            background: '#000',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          <span>ADMIN</span>

          {/* ✅ LOGOUT OFFICIEL NEXTAUTH */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                background: 'red',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              SE DÉCONNECTER
            </button>
          </form>
        </div>

        {children}
      </body>
    </html>
  );
}
