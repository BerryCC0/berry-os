/**
 * GetInfo Panel Component
 * File/folder/app information
 * 
 * Shows:
 * - Icon, name, kind, size
 * - Created/modified dates
 * - Location path
 * - Permissions (read-only)
 * - Custom icon (Phase 7)
 */

import { useEffect } from 'react';
import styles from './GetInfo.module.css';

export interface GetInfoData {
  icon: string;
  name: string;
  kind: string;
  size?: string;
  created?: Date;
  modified?: Date;
  path: string;
  permissions?: string;
}

export interface GetInfoProps {
  data: GetInfoData;
  onClose: () => void;
}

export default function GetInfo({ data, onClose }: GetInfoProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.getInfo} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="getinfo-title"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.title} id="getinfo-title">
            {data.name} Info
          </span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Icon and Name */}
          <div className={styles.header}>
            <img 
              src={data.icon} 
              alt="" 
              className={styles.icon}
              onError={(e) => {
                e.currentTarget.src = '/icons/system/placeholder.svg';
              }}
            />
            <input
              type="text"
              value={data.name}
              readOnly
              className={styles.nameInput}
            />
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Info Fields */}
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Kind:</span>
              <span className={styles.value}>{data.kind}</span>
            </div>

            {data.size && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Size:</span>
                <span className={styles.value}>{data.size}</span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.label}>Where:</span>
              <span className={styles.value}>{data.path}</span>
            </div>

            {data.created && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Created:</span>
                <span className={styles.value}>{formatDate(data.created)}</span>
              </div>
            )}

            {data.modified && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Modified:</span>
                <span className={styles.value}>{formatDate(data.modified)}</span>
              </div>
            )}

            {data.permissions && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Permissions:</span>
                <span className={styles.value}>{data.permissions}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

