'use client';

/**
 * Screensaver Component
 * Mac OS 8 style screensaver - press ESC to exit
 */

import { useEffect } from 'react';
import styles from './Screensaver.module.css';

interface ScreensaverProps {
  onClose: () => void;
}

export default function Screensaver({ onClose }: ScreensaverProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClick = () => {
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <div className={styles.screensaver}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <img 
            src="/icons/apps/berry.svg" 
            alt="Berry OS" 
            width="120" 
            height="120"
            className={styles.floatingLogo}
          />
        </div>
        <div className={styles.message}>
          Press ESC or click to wake
        </div>
      </div>
    </div>
  );
}

