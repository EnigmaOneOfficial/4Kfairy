'use client'
import { useState, useEffect, useCallback } from 'react';
import { Song } from './types';
import styles from './SongCard.module.css';

interface MusicControllerProps {
  songs: Song[];
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  handleSongClick: (song: Song) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicController = ({
  songs,
  selectedSong,
  setSelectedSong,
  isPlaying,
  setIsPlaying,
    currentTime,
    setCurrentTime,
    handleSongClick,
  audioRef,
}: MusicControllerProps) => {
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(.01);
    const [previousVolume, setPreviousVolume] = useState<number | null>(null);
    const [isLooping, setIsLooping] = useState<boolean>(false);
  
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.loop = isLooping;
      }
    }, [isLooping, audioRef]);
  
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [audioRef, volume]);
  
    useEffect(() => {
      const audioElement = audioRef.current;
      if (!audioElement) {
        return;
      }
      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
      };
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    });
  
    const handlePlayPause = useCallback(() => {
      const audioElement = audioRef.current!;
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }, [isPlaying]);
  
    const handleSkipNext = useCallback(() => {
      const currentIndex = songs.findIndex((song) => song === selectedSong);
      const nextIndex = (currentIndex + 1) % songs.length;
      handleSongClick(songs[nextIndex]);
    }, [selectedSong, songs, handleSongClick]);
  
    const handleSkipPrevious = useCallback(() => {
      const currentIndex = songs.findIndex((song) => song === selectedSong);
      const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
      handleSongClick(songs[previousIndex]);
    }, [selectedSong, songs, handleSongClick]);
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          e.preventDefault(); // Prevent scrolling when space is pressed
          handlePlayPause();
        } else if (e.code === 'ArrowUp') {
          setVolume(Math.min(volume + 0.1, 1));
        } else if (e.code === 'ArrowDown') {
          setVolume(Math.max(volume - 0.1, 0));
        } else if (e.code === 'ArrowRight') {
          handleSkipNext();
        } else if (e.code === 'ArrowLeft') {
          handleSkipPrevious();
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [volume, handlePlayPause, handleSkipNext, handleSkipPrevious]);
  
    const handleLoop = () => {
      setIsLooping(!isLooping);
    };
  
    const handleSongEnd = () => {
      if (!isLooping) {
        handleSkipNext();
      }
    };
  
    const handleMute = () => {
      const audioElement = audioRef.current!;
  
      if (audioElement.muted) {
        audioElement.muted = false;
        if (previousVolume !== null) {
          setVolume(previousVolume);
          audioElement.volume = previousVolume;
          setPreviousVolume(null);
        }
      } else {
        audioElement.muted = true;
        setPreviousVolume(volume);
        setVolume(0);
      }
  
      setIsMuted(audioElement.muted);
    };
  
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
  
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        const audioElement = audioRef.current!;
        audioElement.muted = false;
      }
  
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    };
  
    const handleClose = () => {
      const audioElement = audioRef.current!;
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setSelectedSong(null);
    };
  
    const handleTimeUpdate = () => {
      const audioElement = audioRef.current!;
      setCurrentTime(audioElement.currentTime);
    };
  
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseInt(e.target.value, 10);
      setCurrentTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    };
  
    const getMaxSliderValue = () => {
      if (
        selectedSong &&
        selectedSong.mp3Url &&
        audioRef.current &&
        !isNaN(audioRef.current.duration)
      ) {
        return Math.floor(audioRef.current.duration);
      }
      return 0;
    };
  
    const controlsCardStyle = {
      bottom: selectedSong ? '10px' : '-250px',
    };

    return (<div className={styles.controlsCard} style={controlsCardStyle}>
        <audio
            src={selectedSong ? selectedSong.mp3Url : ''}
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleSongEnd}
            autoPlay={isPlaying}
            playsInline
        />
        {selectedSong ? (
          <>
            <h2 className={styles.title}>{selectedSong.title}</h2>
            <div className={styles.controls}>
              <div className={styles.progressBar}></div>
              <div className={styles.buttonWrapper}>
                <button onClick={handlePlayPause}>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={handleClose}>Close</button>
                <button onClick={handleLoop}>
                  {isLooping ? 'Disable Loop' : 'Enable Loop'}
                </button>
                <button onClick={handleSkipPrevious}>Previous</button>
                <button onClick={handleSkipNext}>Next</button>
                <button onClick={handleMute}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>

              <div className={styles.volumeSlider}>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.01'
                  value={volume}
                  onChange={handleVolumeChange}
                  title={`Volume: ${(volume * 100).toFixed(0)}%`}
                />
              </div>

              <div className={styles.timeSlider}>
                <input
                  type='range'
                  min='0'
                  max={getMaxSliderValue()}
                  value={currentTime}
                  onChange={handleSliderChange}
                  title={`Time: ${formatTime(currentTime)}/${formatTime(audioRef.current?.duration ?? 0)}`}
                />
              </div>

              <div className={styles.time}>
                {formatTime(currentTime)} /{' '}
                {formatTime(audioRef.current?.duration ?? 0)}
              </div>
            </div>
          </>
        ) : null}
      </div>)
};

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default MusicController;
