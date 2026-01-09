/**
 * Hook: useLiveSession
 * 
 * Gère la connexion temps réel à une session live
 * - Connexion/déconnexion au channel Pusher
 * - Réception des événements (play, pause, seek, volume)
 * - Synchronisation de l'AudioEngine
 * - Tracking des participants connectés
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher';
import { 
  getSessionChannelName, 
  SESSION_EVENTS,
  SessionState,
  PlayEvent,
  PauseEvent,
  SeekEvent,
  VolumeEvent,
  ParticipantEvent,
} from '@/lib/realtime/events';
import { getAudioEngine, AudioEngineState } from '@/lib/realtime/audioEngine';
import type { Channel, PresenceChannel } from 'pusher-js';

// ========================================
// TYPES
// ========================================

export interface LiveSessionUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface UseLiveSessionOptions {
  sessionId: string;
  userId: string;
  userRole: 'COACH' | 'PARTICIPANT' | 'SUPER_ADMIN';
  mediaUrl?: string | null;
  onError?: (error: string) => void;
}

export interface UseLiveSessionReturn {
  // État connexion
  isConnected: boolean;
  connectionError: string | null;
  
  // État session
  sessionState: SessionState | null;
  audioState: AudioEngineState | null;
  
  // Participants
  participants: LiveSessionUser[];
  participantCount: number;
  
  // Actions Coach
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  endSession: () => Promise<void>;
  
  // Info
  isCoach: boolean;
}

// ========================================
// HOOK
// ========================================

export function useLiveSession(options: UseLiveSessionOptions): UseLiveSessionReturn {
  const { sessionId, userId, userRole, mediaUrl, onError } = options;
  
  // Refs
  const channelRef = useRef<PresenceChannel | null>(null);
  const audioEngineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  
  // État
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [audioState, setAudioState] = useState<AudioEngineState | null>(null);
  const [participants, setParticipants] = useState<LiveSessionUser[]>([]);
  
  const isCoach = userRole === 'COACH' || userRole === 'SUPER_ADMIN';
  
  // ========================================
  // CONNEXION PUSHER
  // ========================================
  
  useEffect(() => {
    const pusher = getPusherClient();
    
    if (!pusher) {
      console.warn('[useLiveSession] Pusher non configuré - mode simulation');
      setIsConnected(true); // Simulation pour dev
      
      // État initial simulé
      setSessionState({
        sessionId,
        status: 'LIVE',
        isPlaying: false,
        currentTime: 0,
        volume: 80,
        mediaUrl: mediaUrl || null,
        coachId: '',
        timestamp: Date.now(),
      });
      
      return;
    }
    
    const channelName = getSessionChannelName(sessionId);
    
    // S'abonner au channel presence
    const channel = pusher.subscribe(channelName) as PresenceChannel;
    channelRef.current = channel;
    
    // Événements de connexion
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setIsConnected(true);
      setConnectionError(null);
      
      // Récupérer les membres présents
      const currentMembers: LiveSessionUser[] = [];
      members.each((member: any) => {
        currentMembers.push({
          id: member.id,
          name: member.info?.name || 'Utilisateur',
          role: member.info?.role || 'PARTICIPANT',
          avatar: member.info?.avatar,
        });
      });
      setParticipants(currentMembers);
    });
    
    channel.bind('pusher:subscription_error', (error: any) => {
      setConnectionError('Erreur de connexion au channel');
      onError?.('Impossible de rejoindre la session');
      console.error('[useLiveSession] Subscription error:', error);
    });
    
    // Événements membres
    channel.bind('pusher:member_added', (member: any) => {
      setParticipants(prev => [...prev, {
        id: member.id,
        name: member.info?.name || 'Utilisateur',
        role: member.info?.role || 'PARTICIPANT',
        avatar: member.info?.avatar,
      }]);
    });
    
    channel.bind('pusher:member_removed', (member: any) => {
      setParticipants(prev => prev.filter(p => p.id !== member.id));
    });
    
    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [sessionId, mediaUrl, onError]);
  
  // ========================================
  // AUDIO ENGINE SETUP
  // ========================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const audioEngine = getAudioEngine();
    audioEngineRef.current = audioEngine;
    
    // S'abonner aux changements d'état audio
    const unsubscribe = audioEngine.subscribe((state) => {
      setAudioState(state);
    });
    
    // Charger le média si disponible
    if (mediaUrl) {
      audioEngine.load(mediaUrl);
    }
    
    return () => {
      unsubscribe();
    };
  }, [mediaUrl]);
  
  // ========================================
  // ÉVÉNEMENTS SESSION
  // ========================================
  
  useEffect(() => {
    const channel = channelRef.current;
    const audioEngine = audioEngineRef.current;
    
    if (!channel) return;
    
    // État complet de la session
    channel.bind(SESSION_EVENTS.STATE, (data: SessionState) => {
      setSessionState(data);
      if (audioEngine && !isCoach) {
        audioEngine.syncWithRemote(data.currentTime, data.isPlaying, data.timestamp);
        audioEngine.setVolume(data.volume);
      }
    });
    
    // Play
    channel.bind(SESSION_EVENTS.PLAY, (data: PlayEvent) => {
      setSessionState(prev => prev ? { ...prev, isPlaying: true, currentTime: data.currentTime } : null);
      if (audioEngine && !isCoach) {
        audioEngine.seek(data.currentTime);
        audioEngine.play();
      }
    });
    
    // Pause
    channel.bind(SESSION_EVENTS.PAUSE, (data: PauseEvent) => {
      setSessionState(prev => prev ? { ...prev, isPlaying: false, currentTime: data.currentTime } : null);
      if (audioEngine && !isCoach) {
        audioEngine.pause();
        audioEngine.seek(data.currentTime);
      }
    });
    
    // Seek
    channel.bind(SESSION_EVENTS.SEEK, (data: SeekEvent) => {
      setSessionState(prev => prev ? { ...prev, currentTime: data.currentTime } : null);
      if (audioEngine && !isCoach) {
        audioEngine.seek(data.currentTime);
      }
    });
    
    // Volume
    channel.bind(SESSION_EVENTS.VOLUME, (data: VolumeEvent) => {
      setSessionState(prev => prev ? { ...prev, volume: data.volume } : null);
      if (audioEngine && !isCoach) {
        audioEngine.setVolume(data.volume);
      }
    });
    
    // End
    channel.bind(SESSION_EVENTS.END, () => {
      setSessionState(prev => prev ? { ...prev, status: 'ENDED', isPlaying: false } : null);
      if (audioEngine) {
        audioEngine.pause();
      }
    });
    
    return () => {
      channel.unbind(SESSION_EVENTS.STATE);
      channel.unbind(SESSION_EVENTS.PLAY);
      channel.unbind(SESSION_EVENTS.PAUSE);
      channel.unbind(SESSION_EVENTS.SEEK);
      channel.unbind(SESSION_EVENTS.VOLUME);
      channel.unbind(SESSION_EVENTS.END);
    };
  }, [isCoach]);
  
  // ========================================
  // ACTIONS COACH
  // ========================================
  
  const emitEvent = useCallback(async (event: string, data: object) => {
    try {
      const response = await fetch(`/api/session/${sessionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur serveur');
      }
    } catch (error) {
      console.error('[useLiveSession] Emit error:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }, [sessionId, onError]);
  
  const play = useCallback(async () => {
    if (!isCoach) return;
    
    const audioEngine = audioEngineRef.current;
    const currentTime = audioEngine?.state.currentTime || 0;
    
    // Action locale immédiate
    await audioEngine?.play();
    
    // Émettre l'événement
    await emitEvent(SESSION_EVENTS.PLAY, { currentTime });
    
    setSessionState(prev => prev ? { ...prev, isPlaying: true } : null);
  }, [isCoach, emitEvent]);
  
  const pause = useCallback(async () => {
    if (!isCoach) return;
    
    const audioEngine = audioEngineRef.current;
    const currentTime = audioEngine?.state.currentTime || 0;
    
    // Action locale immédiate
    audioEngine?.pause();
    
    // Émettre l'événement
    await emitEvent(SESSION_EVENTS.PAUSE, { currentTime });
    
    setSessionState(prev => prev ? { ...prev, isPlaying: false } : null);
  }, [isCoach, emitEvent]);
  
  const seek = useCallback(async (time: number) => {
    if (!isCoach) return;
    
    const audioEngine = audioEngineRef.current;
    
    // Action locale immédiate
    audioEngine?.seek(time);
    
    // Émettre l'événement
    await emitEvent(SESSION_EVENTS.SEEK, { currentTime: time });
    
    setSessionState(prev => prev ? { ...prev, currentTime: time } : null);
  }, [isCoach, emitEvent]);
  
  const setVolume = useCallback(async (volume: number) => {
    if (!isCoach) return;
    
    const audioEngine = audioEngineRef.current;
    
    // Action locale immédiate
    audioEngine?.setVolume(volume);
    
    // Émettre l'événement
    await emitEvent(SESSION_EVENTS.VOLUME, { volume });
    
    setSessionState(prev => prev ? { ...prev, volume } : null);
  }, [isCoach, emitEvent]);
  
  const endSession = useCallback(async () => {
    if (!isCoach) return;
    
    const audioEngine = audioEngineRef.current;
    audioEngine?.pause();
    
    await emitEvent(SESSION_EVENTS.END, {});
    
    setSessionState(prev => prev ? { ...prev, status: 'ENDED', isPlaying: false } : null);
  }, [isCoach, emitEvent]);
  
  // ========================================
  // RETURN
  // ========================================
  
  return {
    isConnected,
    connectionError,
    sessionState,
    audioState,
    participants,
    participantCount: participants.length,
    play,
    pause,
    seek,
    setVolume,
    endSession,
    isCoach,
  };
}
