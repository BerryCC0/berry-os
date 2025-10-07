/**
 * AboutDialog Component
 * System-level "About Berry" dialog
 * Can be triggered from Apple menu without opening a full window
 * Shows Berry OS info + browser/device information
 */

import { useEffect, useState } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import styles from './AboutDialog.module.css';

export interface AboutDialogProps {
  onClose: () => void;
}

// Browser/Device info helper functions
function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox/')) return `Firefox ${ua.split('Firefox/')[1]?.split(' ')[0]}`;
  if (ua.includes('Edg/')) return `Edge ${ua.split('Edg/')[1]?.split(' ')[0]}`;
  if (ua.includes('Chrome/')) return `Chrome ${ua.split('Chrome/')[1]?.split(' ')[0]}`;
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return `Safari ${ua.split('Version/')[1]?.split(' ')[0]}`;
  
  return 'Unknown Browser';
}

function getOS(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) {
    // Try to detect macOS version
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)?/);
    if (match) {
      const version = match[1]?.replace(/_/g, '.');
      return `macOS ${version || ''}`.trim();
    }
    return 'macOS';
  }
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || (platform.includes('iPhone') || platform.includes('iPad'))) return 'iOS';
  
  return platform || 'Unknown OS';
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Mobile') || ua.includes('Android')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  return 'Desktop';
}

function getScreenInfo(): string {
  const { width, height } = window.screen;
  const devicePixelRatio = window.devicePixelRatio || 1;
  return `${width}×${height}${devicePixelRatio > 1 ? ` @${devicePixelRatio}x` : ''}`;
}

export default function AboutDialog({ onClose }: AboutDialogProps) {
  const systemVersion = useSystemStore((state) => state.systemVersion);
  
  // Device/Browser info state
  const [deviceInfo] = useState({
    browser: getBrowserInfo(),
    os: getOS(),
    deviceType: getDeviceType(),
    screen: getScreenInfo(),
    cores: navigator.hardwareConcurrency || 'Unknown',
    memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown',
    connection: (navigator as any).connection?.effectiveType || 'Unknown',
  });

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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.dialog} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="about-title"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.title} id="about-title">About Berry</span>
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
          {/* Berry OS Logo */}
          <div className={styles.logoSection}>
            <img 
              src="/icons/apps/berry.svg" 
              alt="Berry OS" 
              className={styles.logo}
            />
          </div>

          {/* Berry OS Information */}
          <div className={styles.infoSection}>
            <div className={styles.sectionTitle}>Berry OS</div>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>Version:</span>
              <span className={styles.value}>{systemVersion}</span>
            </div>
          </div>

          {/* Device Information */}
          <div className={styles.infoSection}>
            <div className={styles.sectionTitle}>Your Device</div>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>Browser:</span>
              <span className={styles.value}>{deviceInfo.browser}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Operating System:</span>
              <span className={styles.value}>{deviceInfo.os}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Device Type:</span>
              <span className={styles.value}>{deviceInfo.deviceType}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Screen:</span>
              <span className={styles.value}>{deviceInfo.screen}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>CPU Cores:</span>
              <span className={styles.value}>{deviceInfo.cores}</span>
            </div>

            {deviceInfo.memory !== 'Unknown' && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Memory:</span>
                <span className={styles.value}>{deviceInfo.memory}</span>
              </div>
            )}

            {deviceInfo.connection !== 'Unknown' && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Connection:</span>
                <span className={styles.value}>{deviceInfo.connection.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Footer - Apple-style but CC0 */}
          <div className={styles.footer}>
            <a 
              href="https://github.com/BerryOS/berryos" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              Open Source on GitHub
            </a>
            <p className={styles.copyright}>
              2025 Berry Inc.
            </p>
            <p className={styles.license}>
              Berry OS released under WTFPL.
            </p>
            <p className={styles.rights}>
              CC0, All Rights Released. ⌐◨-◨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

