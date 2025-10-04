'use client';

/**
 * Dialog Component
 * Universal Mac OS 8 style dialog/modal
 * Works on both desktop and mobile
 */

import { useEffect } from 'react';
import Button from '../Button/Button';
import styles from './Dialog.module.css';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'default' | 'cancel';
  }>;
  width?: number;
  height?: number;
  showCloseButton?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  buttons = [],
  width = 400,
  height,
  showCloseButton = true,
}: DialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Dialog */}
      <div
        className={styles.dialog}
        style={{
          width: `${width}px`,
          height: height ? `${height}px` : 'auto',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close dialog"
            >
              <div className={styles.closeButtonInner} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className={styles.buttonRow}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant || 'default'}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

