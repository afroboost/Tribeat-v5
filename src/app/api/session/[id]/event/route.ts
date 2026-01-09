/**
 * API Route: Session Events
 * POST /api/session/[id]/event
 * 
 * Émet des événements temps réel pour une session
 * COACH uniquement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { getPusherServer } from '@/lib/realtime/pusher';
import { getSessionChannelName, SESSION_EVENTS, SessionState } from '@/lib/realtime/events';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Vérifier que la session existe et que l'utilisateur est le coach
    const liveSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { 
        id: true, 
        coachId: true, 
        status: true,
        mediaUrl: true,
      }
    });

    if (!liveSession) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    const isCoach = liveSession.coachId === session.user.id;
    const isAdmin = session.user.role === 'SUPER_ADMIN';

    if (!isCoach && !isAdmin) {
      return NextResponse.json({ error: 'Action réservée au coach' }, { status: 403 });
    }

    // 3. Parser l'événement
    const body = await request.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json({ error: 'event et data requis' }, { status: 400 });
    }

    // 4. Valider le type d'événement
    const validEvents = Object.values(SESSION_EVENTS);
    if (!validEvents.includes(event)) {
      return NextResponse.json({ error: 'Type d\'événement invalide' }, { status: 400 });
    }

    // 5. Émettre via Pusher
    const pusher = getPusherServer();
    const channelName = getSessionChannelName(sessionId);
    
    // Ajouter timestamp serveur pour sync
    const eventData = {
      ...data,
      sessionId,
      timestamp: Date.now(),
    };

    if (pusher) {
      await pusher.trigger(channelName, event, eventData);
    } else {
      // Mode dev - logger l'événement
      console.log(`[Session Event] ${channelName} -> ${event}:`, eventData);
    }

    // 6. Pour certains événements, persister en DB
    if (event === SESSION_EVENTS.PLAY || event === SESSION_EVENTS.END) {
      // Mettre à jour le statut de la session si nécessaire
      if (event === SESSION_EVENTS.END) {
        await prisma.session.update({
          where: { id: sessionId },
          data: { 
            status: 'COMPLETED',
            endedAt: new Date(),
          }
        });
      } else if (event === SESSION_EVENTS.PLAY && liveSession.status === 'SCHEDULED') {
        await prisma.session.update({
          where: { id: sessionId },
          data: { 
            status: 'LIVE',
            startedAt: new Date(),
          }
        });
      }
    }

    return NextResponse.json({ success: true, event, channelName });

  } catch (error) {
    console.error('[Session Event Error]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/session/[id]/event
 * Récupère l'état actuel de la session (pour nouveaux arrivants)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Récupérer la session
    const liveSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { 
        id: true, 
        coachId: true, 
        status: true,
        mediaUrl: true,
        mediaType: true,
        title: true,
      }
    });

    if (!liveSession) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    // 3. Retourner l'état initial
    const state: SessionState = {
      sessionId: liveSession.id,
      status: liveSession.status === 'LIVE' ? 'LIVE' : 
              liveSession.status === 'COMPLETED' ? 'ENDED' : 'PAUSED',
      isPlaying: false, // État par défaut, sera mis à jour via événements
      currentTime: 0,
      volume: 80,
      mediaUrl: liveSession.mediaUrl,
      coachId: liveSession.coachId,
      timestamp: Date.now(),
    };

    return NextResponse.json({ success: true, state });

  } catch (error) {
    console.error('[Session State Error]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
