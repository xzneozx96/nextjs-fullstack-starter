import { Button } from '@/shared/components/ui/button';
import { PauseIcon, PlayIcon } from '@/shared/icons';
import { cn } from '@/shared/utils/utils';
import React, { useEffect, useRef, useState } from 'react';

type AudioPlayerProps = {
  src: string;
  className?: string;
  title?: string;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    // Reset state when src changes
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      setCurrentTime(0);
      setDuration(0);
    }, 0);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load audio');
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Clean up event listeners
    return () => {
      clearTimeout(timer);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}

      <audio ref={audioRef} src={src} preload="metadata">
        <track kind="captions" label="Captions" srcLang="en" />
      </audio>

      <div className="flex items-center space-x-2">
        <Button
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
          variant="ghost"
          className={cn(
            '!bg-brand-500/[0.08] rounded-full min-w-10 min-h-10',
            (isLoading || !!error) && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading
            ? (
                <span>
                  <div className="size-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </span>
              )
            : isPlaying
              ? (
                  <span><PauseIcon className="size-5 text-brand-600" /></span>
                )
              : (
                  <span><PlayIcon className="size-5 text-brand-600" /></span>
                )}
        </Button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading || !!error}
            className={cn(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              'accent-blue-600',
              (isLoading || !!error) && 'opacity-50 cursor-not-allowed',
            )}
            style={{
              // Ensure the range input is visible
              display: 'block',
              width: '100%',
            }}
          />
        </div>

        <div className="text-xs text-gray-500 w-16 text-right">
          {isLoading ? '--:--' : formatTime(currentTime)}
          {' '}
          /
          {isLoading ? '--:--' : formatTime(duration)}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default AudioPlayer;
