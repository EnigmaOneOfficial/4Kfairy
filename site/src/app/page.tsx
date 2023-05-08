'use client'
import AudioVisualizer from '@/components/AudioVisualizer';
import React, { useRef, useState } from 'react';
import SongCard from '../components/SongCard';
import { songs } from '../components/songs';
import styles from './page.module.css';

const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null);

  return (
    <div className={styles.main}>
      <AudioVisualizer audioRef={audioRef} analyser={analyser} audioContext={audioContext} source={source} setAnalyser={setAnalyser} setAudioContext={setAudioContext} setSource={setSource}/>
      <SongCard songs={songs} audioRef={audioRef} />
    </div>
  );
};

export default App;
