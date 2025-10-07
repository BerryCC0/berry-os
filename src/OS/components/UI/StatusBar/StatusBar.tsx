/**
 * StatusBar Component
 * Bottom bar in windows showing info, counts, status
 * 
 * Examples:
 * - Finder: "42 items, 3 selected"
 * - Media Viewer: "Image 5 of 12"
 * - Text Editor: "Line 42, Column 15"
 */

import styles from './StatusBar.module.css';

export interface StatusBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export default function StatusBar({
  left,
  center,
  right,
  className = '',
}: StatusBarProps) {
  return (
    <div className={`${styles.statusBar} ${className}`}>
      <div className={styles.section}>{left}</div>
      <div className={styles.section}>{center}</div>
      <div className={styles.section}>{right}</div>
    </div>
  );
}

