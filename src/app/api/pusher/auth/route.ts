/**
 * API Route: Pusher Auth
 * POST /api/pusher/auth
 * 
 * Authentifie les utilisateurs pour les channels Pusher privés/presence
 * Requis pour les channels "presence-session-{id}"
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { getPusherServer } from '@/lib/realtime/pusher';
import { getSessionIdFromChannel } from '@/lib/realtime/events';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Parser le body (format URL-encoded de Pusher)
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // 3. Vérifier la configuration Pusher
    const pusher = getPusherServer();
    if (!pusher) {
      // Mode dev sans Pusher - autoriser quand même
      console.warn('[Pusher Auth] Pusher non configuré - autorisation simulée');
      return NextResponse.json({ 
        auth: 'dev-mode',
        channel_data: JSON.stringify({
          user_id: session.user.id,
          user_info: {
            name: session.user.name,
            role: session.user.role,
          }
        })
      });
    }

    // 4. Pour les channels presence-session-*, vérifier l'accès
    if (channelName.startsWith('presence-session-')) {
      const sessionId = getSessionIdFromChannel(channelName);
      
      if (sessionId) {
        // Vérifier que la session existe
        const liveSession = await prisma.session.findUnique({
          where: { id: sessionId },
          select: { 
            id: true, 
            coachId: true, 
            status: true,
            isPublic: true,
          }
        });

        if (!liveSession) {
          return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
        }

        // Vérifier les droits d'accès
        const isCoach = liveSession.coachId === session.user.id;
        const isAdmin = session.user.role === 'SUPER_ADMIN';
        
        // Pour une session publique ou si l'utilisateur a les droits
        if (!liveSession.isPublic && !isCoach && !isAdmin) {
          // Vérifier si participant inscrit
          const isParticipant = await prisma.sessionParticipant.findUnique({
            where: {
              userId_sessionId: {
                userId: session.user.id,
                sessionId: sessionId,
              }
            }
          });

          if (!isParticipant) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
          }
        }
      }
    }

    // 5. Authentifier avec Pusher (channel presence)
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || 'Utilisateur',
        role: session.user.role || 'PARTICIPANT',
        avatar: session.user.avatar || null,
      }
    };

    const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
    
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error('[Pusher Auth Error]', error);
    return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 500 });
  }
}
