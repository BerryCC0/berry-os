/**
 * ProgressBar Component
 * File operations, loading states
 * Mac OS 8 Style: Classic "barber pole" indeterminate animation
 */

import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number; // 0-100
  indeterminate?: boolean; // Barber pole animation
  label?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ProgressBar({
  value,
  indeterminate = false,
  label,
  size = 'medium',
  className = '',
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={`${styles.progressBar} ${styles[size]}`}>
        <div className={styles.track}>
          <div
            className={`${styles.fill} ${indeterminate ? styles.indeterminate : ''}`}
            style={{
              width: indeterminate ? '100%' : `${clampedValue}%`,
            }}
          >
            {indeterminate && <div className={styles.barberPole} />}
          </div>
        </div>
      </div>
      {!indeterminate && (
        <div className={styles.percentage}>{Math.round(clampedValue)}%</div>
      )}
    </div>
  );
}

