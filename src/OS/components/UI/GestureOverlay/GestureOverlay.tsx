/**
 * GestureOverlay Component
 * Visual swipe indicators and gesture hints for mobile
 * Shows hints on first use
 */

import { useState, useEffect } from 'react';
import styles from './GestureOverlay.module.css';

export interface GestureHint {
  gesture: 'swipe-up' | 'swipe-down' | 'swipe-left' | 'swipe-right' | 'long-press';
  description: string;
  icon?: string;
}

export interface GestureOverlayProps {
  hints: GestureHint[];
  autoHide?: boolean; // Auto-hide after first interaction
  duration?: number; // How long to show (ms)
  onDismiss?: () => void;
}

const GESTURE_ICONS: Record<GestureHint['gesture'], string> = {
  'swipe-up': '↑',
  'swipe-down': '↓',
  'swipe-left': '←',
  'swipe-right': '→',
  'long-press': '⊙',
};

export default function GestureOverlay({
  hints,
  autoHide = true,
  duration = 5000,
  onDismiss,
}: GestureOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={handleDismiss}>
      <div className={styles.content}>
        <div className={styles.title}>Gestures</div>
        <div className={styles.hints}>
          {hints.map((hint, index) => (
            <div key={index} className={styles.hint}>
              <div className={styles.icon}>
                {hint.icon || GESTURE_ICONS[hint.gesture]}
              </div>
              <div className={styles.description}>{hint.description}</div>
            </div>
          ))}
        </div>
        <button className={styles.dismissButton} onClick={handleDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

