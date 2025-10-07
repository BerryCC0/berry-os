/**
 * Alert Component
 * System-level alerts, confirmations, and prompts
 * 
 * Examples:
 * - "Are you sure you want to empty the Trash?"
 * - "The application quit unexpectedly."
 * - "This file is read-only."
 */

import { useEffect } from 'react';
import Button from '../Button/Button';
import styles from './Alert.module.css';

export type AlertType = 'info' | 'warning' | 'error' | 'question';

export interface AlertButton {
  label: string;
  action: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

export interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  icon?: string;
  buttons: AlertButton[];
  defaultButton?: number; // Which button is default (Enter key)
  sound?: boolean; // Play system beep
  onClose?: () => void;
}

export default function Alert({
  type,
  title,
  message,
  icon,
  buttons,
  defaultButton = 0,
  sound = false,
  onClose,
}: AlertProps) {
  // Play system sound on mount
  useEffect(() => {
    if (sound) {
      // TODO: Integrate with sound system when implemented
      // playSound(type === 'error' ? 'error' : 'beep');
    }
  }, [sound, type]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key triggers default button
      if (e.key === 'Enter' && defaultButton !== undefined) {
        e.preventDefault();
        buttons[defaultButton]?.onClick();
      }
      
      // Escape key triggers last button (usually Cancel)
      if (e.key === 'Escape') {
        e.preventDefault();
        buttons[buttons.length - 1]?.onClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [buttons, defaultButton]);

  const getAlertIcon = () => {
    if (icon) return icon;
    
    // Default system icons based on type
    switch (type) {
      case 'error':
        return '/icons/system/error.svg';
      case 'warning':
        return '/icons/system/warning.svg';
      case 'question':
        return '/icons/system/question.svg';
      case 'info':
      default:
        return '/icons/system/info.svg';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.alert} 
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.title} id="alert-title">{title}</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <img 
              src={getAlertIcon()} 
              alt={type} 
              className={styles.alertIcon}
              onError={(e) => {
                // Fallback if icon doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className={styles.messageContainer}>
            <p className={styles.message} id="alert-message">{message}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttons}>
          {buttons.map((button, index) => {
            // Map Alert button actions to Button variants
            let variant: 'default' | 'primary' | 'cancel' = 'default';
            if (button.action === 'primary' || button.action === 'danger') {
              variant = 'primary'; // Danger actions use primary styling (emphasized)
            } else if (button.action === 'secondary') {
              variant = 'cancel';
            }
            
            return (
              <Button
                key={index}
                onClick={button.onClick}
                variant={variant}
                className={`${styles.button} ${index === defaultButton ? styles.defaultButton : ''}`}
              >
                {button.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

