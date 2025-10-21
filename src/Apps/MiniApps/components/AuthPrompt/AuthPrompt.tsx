/**
 * AuthPrompt Component
 * Farcaster authentication UI for Mini Apps using Neynar SDK
 */

'use client';

import { NeynarAuthButton } from '@neynar/react';
import { useFarcasterAuth } from '../../utils/hooks/useFarcasterAuth';
import styles from './AuthPrompt.module.css';

export default function AuthPrompt() {
  const { isConfigured } = useFarcasterAuth();

  if (!isConfigured) {
    return (
      <div className={styles.authPrompt}>
        <div className={styles.card}>
          <div className={styles.icon}>⚠️</div>
          <h2 className={styles.title}>Configuration Required</h2>
          <p className={styles.message}>
            Neynar is not configured. Please add your{' '}
            <code className={styles.code}>NEXT_PUBLIC_NEYNAR_CLIENT_ID</code>{' '}
            to your environment variables.
          </p>
          <div className={styles.hint}>
            Get your Client ID at{' '}
            <a
              href="https://neynar.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              neynar.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPrompt}>
      <div className={styles.card}>
        <div className={styles.icon}>🚀</div>
        <h2 className={styles.title}>Welcome to Mini Apps</h2>
        <p className={styles.message}>
          Sign in with your Farcaster account to browse and launch Mini Apps
          from the Farcaster ecosystem.
        </p>

        <div className={styles.siwnContainer}>
          <NeynarAuthButton />
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Powered by{' '}
            <a
              href="https://neynar.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Neynar
            </a>
          </p>
          <p className={styles.hint}>
            Sign in with Neynar provides read-only access to your Farcaster account.
            <br />
            You can browse and launch Mini Apps from the Farcaster ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}

