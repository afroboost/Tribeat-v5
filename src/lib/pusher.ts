import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// ========================================
// CONFIGURATION CHECK
// ========================================
const isPusherConfigured = () => {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  return !!(appId && key && secret && 
    appId !== 'placeholder-app-id' && 
    key !== 'placeholder-key' && 
    secret !== 'placeholder-secret');
};

// ========================================
// SERVER-SIDE PUSHER (API Routes)
// ========================================
let _pusherServer: Pusher | null = null;

export const getPusherServer = (): Pusher | null => {
  if (!isPusherConfigured()) {
    console.warn('[Pusher] Non configuré - fonctionnalités temps réel désactivées');
    return null;
  }
  try {
    if (!_pusherServer) {
      _pusherServer = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        useTLS: true,
      });
    }
    return _pusherServer;
  } catch (error) {
    console.error('[Pusher] Erreur initialisation serveur:', error);
    return null;
  }
};

// Legacy export for compatibility
export const pusherServer = isPusherConfigured() ? new Pusher({
  appId: process.env.PUSHER_APP_ID || 'placeholder-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'placeholder-key',
  secret: process.env.PUSHER_SECRET || 'placeholder-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
}) : null;

// ========================================
// CLIENT-SIDE PUSHER (Components)
// ========================================
let _pusherClient: PusherClient | null = null;

export const getPusherClient = (): PusherClient | null => {
  if (typeof window === 'undefined') return null;
  
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (!key || key === 'placeholder-key') {
    console.warn('[Pusher] Client non configuré - fonctionnalités temps réel désactivées');
    return null;
  }
  
  try {
    if (!_pusherClient) {
      _pusherClient = new PusherClient(key, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        authEndpoint: '/api/pusher/auth',
      });
    }
    return _pusherClient;
  } catch (error) {
    console.error('[Pusher] Erreur initialisation client:', error);
    return null;
  }
};
