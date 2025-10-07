/**
 * NotificationCenter Component
 * System notifications (non-blocking alerts)
 * Position: Top-right corner, slides in
 * Style: Classic Mac OS alert box style
 */

import { useState, useEffect } from 'react';
import styles from './NotificationCenter.module.css';

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
  actions?: Array<{ label: string; action: () => void }>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

export default function NotificationCenter({
  notifications,
  onDismiss,
  maxVisible = 3,
}: NotificationCenterProps) {
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setDismissing((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDismiss(id);
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200); // Match animation duration
  };

  const getIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return '/icons/system/check.svg';
      case 'warning':
        return '/icons/system/warning.svg';
      case 'error':
        return '/icons/system/error.svg';
      case 'info':
      default:
        return '/icons/system/info.svg';
    }
  };

  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div className={styles.notificationCenter}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type || 'info']} ${dismissing.has(notification.id) ? styles.dismissing : ''}`}
        >
          <button
            className={styles.closeButton}
            onClick={() => handleDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>

          <div className={styles.content}>
            <div className={styles.iconContainer}>
              <img
                src={getIcon(notification)}
                alt=""
                className={styles.icon}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className={styles.textContainer}>
              <div className={styles.title}>{notification.title}</div>
              <div className={styles.message}>{notification.message}</div>

              {notification.actions && notification.actions.length > 0 && (
                <div className={styles.actions}>
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      className={styles.actionButton}
                      onClick={() => {
                        action.action();
                        handleDismiss(notification.id);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

