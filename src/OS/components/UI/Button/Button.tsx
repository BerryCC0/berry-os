'use client';

/**
 * Button Component
 * Classic Mac OS 8 button with proper states
 */

import TouchTarget from '../TouchTarget/TouchTarget';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'cancel';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className = '',
  ariaLabel,
  type = 'button',
}: ButtonProps) {
  const buttonClassName = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TouchTarget
      onTap={onClick}
      disabled={disabled}
      haptic={true}
      ariaLabel={ariaLabel}
      className={buttonClassName}
    >
      <button
        type={type}
        disabled={disabled}
        className={styles.inner}
        tabIndex={disabled ? -1 : 0}
      >
        {children}
      </button>
    </TouchTarget>
  );
}

