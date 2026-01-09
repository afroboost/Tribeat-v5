/**
 * CoachControls - Panneau de contrôle pour le Coach
 * 
 * Contrôles:
 * - Play / Pause
 * - Seek (barre de progression cliquable)
 * - Volume
 * - Terminer la session
 */

'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Square,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { AudioEngineState } from '@/lib/realtime/audioEngine';

interface CoachControlsProps {
  isPlaying: boolean;
  audioState: AudioEngineState | null;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onEndSession: () => void;
  disabled?: boolean;
}

export function CoachControls({
  isPlaying,
  audioState,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onEndSession,
  disabled = false,
}: CoachControlsProps) {
  
  const currentTime = audioState?.currentTime || 0;
  const duration = audioState?.duration || 0;
  const volume = audioState?.volume || 80;
  const isLoaded = audioState?.isLoaded || false;
  
  // Format time: mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle seek from slider
  const handleSeek = (values: number[]) => {
    if (values[0] !== undefined) {
      onSeek(values[0]);
    }
  };
  
  // Handle volume from slider
  const handleVolume = (values: number[]) => {
    if (values[0] !== undefined) {
      onVolumeChange(values[0]);
    }
  };
  
  // Skip forward/backward 10 seconds
  const skipForward = () => onSeek(Math.min(currentTime + 10, duration));
  const skipBackward = () => onSeek(Math.max(currentTime - 10, 0));
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4" data-testid="coach-controls">
      {/* Barre de progression */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={disabled || !isLoaded}
          className="cursor-pointer"
          data-testid="progress-slider"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Contrôles principaux */}
      <div className="flex items-center justify-center gap-2">
        {/* Skip Back */}
        <Button
          variant="ghost"
          size="icon"
          onClick={skipBackward}
          disabled={disabled || !isLoaded}
          className="text-gray-300 hover:text-white"
          data-testid="skip-back-button"
        >
          <SkipBack className="w-5 h-5" />
        </Button>
        
        {/* Play/Pause */}
        <Button
          variant="default"
          size="lg"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled || !isLoaded}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700"
          data-testid="play-pause-button"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>
        
        {/* Skip Forward */}
        <Button
          variant="ghost"
          size="icon"
          onClick={skipForward}
          disabled={disabled || !isLoaded}
          className="text-gray-300 hover:text-white"
          data-testid="skip-forward-button"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Volume */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
          className="text-gray-300 hover:text-white shrink-0"
          data-testid="mute-button"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={handleVolume}
          disabled={disabled}
          className="flex-1"
          data-testid="volume-slider"
        />
        <span className="text-xs text-gray-400 w-8 text-right">{volume}%</span>
      </div>
      
      {/* État du chargement */}
      {!isLoaded && (
        <p className="text-center text-sm text-yellow-500">
          {audioState?.error || 'Chargement du média...'}
        </p>
      )}
      
      {/* Terminer la session */}
      <div className="pt-4 border-t border-gray-700">
        <Button
          variant="destructive"
          onClick={onEndSession}
          disabled={disabled}
          className="w-full"
          data-testid="end-session-button"
        >
          <Square className="w-4 h-4 mr-2" />
          Terminer la session
        </Button>
      </div>
    </div>
  );
}
