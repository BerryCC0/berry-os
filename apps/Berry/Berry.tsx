'use client';

/**
 * Berry
 * System information dialog
 */

import { useSystemStore } from '../../system/store/systemStore';
import styles from './Berry.module.css';

interface BerryProps {
  windowId: string;
}

export default function Berry({ windowId }: BerryProps) {
  const systemVersion = useSystemStore((state) => state.systemVersion);
  const bootTime = useSystemStore((state) => state.bootTime);
  const runningApps = useSystemStore((state) => state.runningApps);
  const windows = useSystemStore((state) => state.windows);

  // Calculate uptime
  const uptime = Date.now() - bootTime;
  const uptimeMinutes = Math.floor(uptime / 1000 / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);

  const formatUptime = () => {
    if (uptimeDays > 0) {
      return `${uptimeDays} day${uptimeDays > 1 ? 's' : ''}, ${uptimeHours % 24} hour${uptimeHours % 24 !== 1 ? 's' : ''}`;
    }
    if (uptimeHours > 0) {
      return `${uptimeHours} hour${uptimeHours > 1 ? 's' : ''}, ${uptimeMinutes % 60} minute${uptimeMinutes % 60 !== 1 ? 's' : ''}`;
    }
    return `${uptimeMinutes} minute${uptimeMinutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className={styles.container}>
      {/* Mac OS 8 Logo/Icon */}
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <div className={styles.logoText}>Nouns OS</div>
        </div>
      </div>

      {/* System Information */}
      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.label}>System Version:</span>
          <span className={styles.value}>{systemVersion}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Built By:</span>
          <span className={styles.value}>Berry</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoRow}>
          <span className={styles.label}>Uptime:</span>
          <span className={styles.value}>{formatUptime()}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Running Apps:</span>
          <span className={styles.value}>{Object.keys(runningApps).length}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Open Windows:</span>
          <span className={styles.value}>{Object.keys(windows).length}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoRow}>
          <span className={styles.label}>Memory:</span>
          <span className={styles.value}>Unlimited</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Processor:</span>
          <span className={styles.value}>Web3 Native</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.copyright}>
          © 2025 Berry. All rights reserved.
        </p>
        <p className={styles.tagline}>
          Mac OS 8 reimagined for the blockchain era
        </p>
      </div>
    </div>
  );
}

