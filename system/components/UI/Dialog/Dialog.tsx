'use client';

/**
 * Dialog Component
 * Mac OS 8 system dialog / alert
 */

import { useEffect } from 'react';
import Button from '../Button/Button';
import styles from './Dialog.module.css';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  icon?: 'info' | 'warning' | 'error' | 'question';
  buttons?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'cancel';
  }[];
  preventClose?: boolean; // Prevent closing by clicking outside
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  message,
  icon = 'info',
  buttons = [{ label: 'OK', onClick: onClose, variant: 'primary' }],
  preventClose = false,
}: DialogProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  const getIconSymbol = () => {
    switch (icon) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '⛔';
      case 'question':
        return '❓';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        {/* Title Bar */}
        {title && (
          <div className={styles.titleBar}>
            <div id="dialog-title" className={styles.title}>
              {title}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>{getIconSymbol()}</span>
          </div>
          <div className={styles.message}>{message}</div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || 'default'}
              onClick={() => {
                button.onClick();
                if (!preventClose) {
                  onClose();
                }
              }}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

