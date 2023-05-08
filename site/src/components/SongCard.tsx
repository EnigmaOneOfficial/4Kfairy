import { useState, useEffect } from 'react';
import styles from './SongCard.module.css';
import { Song } from './types';
import MusicController from './MusicController';
interface SongCardProps {
  songs: Song[];
  audioRef: React.RefObject<HTMLAudioElement>;
}

const SongCard = ({ songs, audioRef}: SongCardProps) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [songDurations, setSongDurations] = useState<Map<string, number>>(
    new Map()
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const updateSongDurations = async () => {
      const newDurations = new Map<string, number>();
      const promises = songs.map(async (song) => {
        if (song.duration) {
          newDurations.set(song.title, song.duration);
        } else if (song.mp3Url) {
          const audio = new Audio(song.mp3Url);
          await new Promise((resolve) =>
            audio.addEventListener('loadedmetadata', () => {
              newDurations.set(song.title, audio.duration);
              resolve(null);
            })
          );
        }
      });
      await Promise.all(promises);
      setSongDurations(newDurations);
    };
    updateSongDurations();
  }, [songs]);

  const getSongDuration = (song: Song) => {
    const duration = songDurations.get(song.title);
    return duration ? formatTime(duration) : '00:00';
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(true);
  };

  const songListContainerStyle = {
    left: selectedSong ? '10px' : 'calc(50% - 200px)',
  };

  return (
    <div className={styles.container}>
      <MusicController
        songs={songs}
        selectedSong={selectedSong}
        setSelectedSong={setSelectedSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        handleSongClick={handleSongClick}
        audioRef={audioRef}
      />
      <div className={styles.songListContainer} style={songListContainerStyle}>
        <div className={styles.songList}>
          {songs.map((song, index) => (
            <div
              key={index}
              className={styles.song}
              onClick={() => handleSongClick(song)}
            >
              <div className={styles.songTitle}>{song.title}</div>
              <div className={styles.songDuration}>{getSongDuration(song)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

export default SongCard;
