/**
 * NextAuth Route Handler
 * 
 * Point d'entrée pour toutes les routes NextAuth
 * Utilise /nextauth/* pour éviter le conflit avec le proxy /api/*
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Export handlers GET et POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
