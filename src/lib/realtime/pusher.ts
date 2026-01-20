/**
 * Pusher Configuration - Production Ready
 * 
 * SERVER: pusherServer pour émettre des événements
 * CLIENT: getPusherClient() singleton pour recevoir
 * 
 * SÉCURITÉ:
 * - Auth obligatoire sur channels presence
 * - Vérification rôle COACH pour émission
 * - Graceful fallback si non configuré
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// ========================================
// CONFIGURATION
// ========================================

const config = {
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
};

// ========================================
// HELPERS
// ========================================

export function isPusherConfigured(): boolean {
  return !!(
    config.appId && 
    config.key && 
    config.secret &&
    config.appId !== 'placeholder-app-id' &&
    config.key !== 'placeholder-key' &&
    config.secret !== 'placeholder-secret'
  );
}

// ========================================
// SERVER-SIDE PUSHER
// ========================================

let _pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!isPusherConfigured()) {
    // Retourne un mock qui ne fait rien mais ne crash pas
    console.warn('[Pusher] Non configuré - événements ignorés');
    return {
      trigger: async () => ({}),
      authorizeChannel: () => ({ auth: 'mock', channel_data: '{}' }),
    } as unknown as Pusher;
  }
  
  try {
    if (!_pusherServer) {
      _pusherServer = new Pusher({
        appId: config.appId,
        key: config.key,
        secret: config.secret,
        cluster: config.cluster,
        useTLS: true,
      });
    }
    return _pusherServer;
  } catch (error) {
    console.error('[Pusher] Erreur initialisation serveur:', error);
    // Retourne un mock en cas d'erreur
    return {
      trigger: async () => ({}),
      authorizeChannel: () => ({ auth: 'mock', channel_data: '{}' }),
    } as unknown as Pusher;
  }
}

// ========================================
// CLIENT-SIDE PUSHER
// ========================================

let _pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!isPusherConfigured()) {
    console.warn('[Pusher] Client non configuré - temps réel désactivé');
    return null;
  }
  
  try {
    if (!_pusherClient) {
      _pusherClient = new PusherClient(config.key, {
        cluster: config.cluster,
        authEndpoint: '/api/pusher/auth',
        forceTLS: true,
      });
      
      // Debug logging
      _pusherClient.connection.bind('connected', () => {
        console.log('[Pusher] Connecté - Socket ID:', _pusherClient?.connection.socket_id);
      });
      
      _pusherClient.connection.bind('error', (err: Error) => {
        console.error('[Pusher] Erreur connexion:', err);
      });
      
      _pusherClient.connection.bind('disconnected', () => {
        console.log('[Pusher] Déconnecté');
      });
    }
    
    return _pusherClient;
  } catch (error) {
    console.error('[Pusher] Erreur initialisation client:', error);
    return null;
  }
}

export function getChannelName(sessionId: string): string {
  return `presence-session-${sessionId}`;
}

export const LIVE_EVENTS = {
  STATE_UPDATE: 'state:update',
  PLAY: 'playback:play',
  PAUSE: 'playback:pause',
  SEEK: 'playback:seek',
  VOLUME: 'playback:volume',
  END: 'session:end',
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
} as const;
