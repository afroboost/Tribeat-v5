import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';

// FORCE DYNAMIC - NO CACHE
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tribeat - Sessions Live Interactives',
  description: 'Plateforme de sessions live synchronisées',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body 
        className={inter.className} 
        style={{ 
          backgroundColor: '#f8fafc', 
          color: '#1e293b',
          minHeight: '100vh'
        }}
      >
        {/* DEBUG MODE - TEMPORAIRE */}
        <div style={{ padding: 20, background: "#ffeded", color: "#000", borderBottom: "3px solid #ff0000" }}>
          <strong>TRIBEAT DEBUG MODE</strong><br />
          Layout global rendu correctement
        </div>
        
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
