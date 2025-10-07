/**
 * Spinner Component
 * Small loading indicators
 * Mac OS 8 Style: Watch cursor animation or spinning beach ball
 */

import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export default function Spinner({
  size = 'medium',
  color,
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Loading"
    >
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
}

