'use client';

/**
 * Loading Screen Component
 * Mac OS 8 boot screen while preferences load
 */

import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Simple: if not loading, don't show
  if (!isLoading) return null;

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <img 
            src="/icons/apps/berry.svg" 
            alt="Berry OS" 
            width="80" 
            height="80"
          />
        </div>
        <div className={styles.name}>Berry OS</div>
        <div className={styles.version}>Version 8.0.0</div>
        <div className={styles.loading}>
          Loading{dots}
        </div>
      </div>
    </div>
  );
}

