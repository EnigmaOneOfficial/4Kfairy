'use client'
import React, { useEffect } from 'react';
import SongCard from '../components/SongCard';
import { Song, defaultSongs } from '../components/types';
import styles from './page.module.css';

const App: React.FC = () => {
 

  return (
    <div className={styles.main}>
      <SongCard songs={defaultSongs} />
    </div>
  );
};

export default App;
