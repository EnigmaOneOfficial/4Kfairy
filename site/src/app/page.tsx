'use client'
import AudioVisualizer from '@/components/AudioVisualizer';
import React, { useRef } from 'react';
import SongCard from '../components/SongCard';
import { songs } from '../components/songs';
import styles from './page.module.css';

const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className={styles.main}>
      <AudioVisualizer audioRef={audioRef}/>
      <SongCard songs={songs} audioRef={audioRef} />
    </div>
  );
};

export default App;
