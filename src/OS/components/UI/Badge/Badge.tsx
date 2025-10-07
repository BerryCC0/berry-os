/**
 * Badge Component
 * Notification counts on icons
 */

import styles from './Badge.module.css';

export interface BadgeProps {
  count: number;
  max?: number; // Show "99+" if over
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  children?: React.ReactNode;
}

export default function Badge({
  count,
  max = 99,
  position = 'top-right',
  className = '',
  children,
}: BadgeProps) {
  if (count <= 0) {
    return <>{children}</>;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <div className={`${styles.badgeContainer} ${className}`}>
      {children}
      <span className={`${styles.badge} ${styles[position]}`}>
        {displayCount}
      </span>
    </div>
  );
}

