/**
 * Divider Component
 * Reusable divider/separator
 */

import styles from './Divider.module.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
  className?: string;
}

export default function Divider({
  orientation = 'horizontal',
  spacing = 8,
  className = '',
}: DividerProps) {
  return (
    <div
      className={`${styles.divider} ${styles[orientation]} ${className}`}
      style={{
        [orientation === 'horizontal' ? 'marginTop' : 'marginLeft']: `${spacing}px`,
        [orientation === 'horizontal' ? 'marginBottom' : 'marginRight']: `${spacing}px`,
      }}
    />
  );
}

