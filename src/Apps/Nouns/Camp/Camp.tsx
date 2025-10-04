/**
 * Nouns Camp
 * Browse and create proposals on Nouns Camp
 */

'use client';

import styles from './Camp.module.css';

interface CampProps {
  windowId: string;
}

export default function Camp({ windowId }: CampProps) {
  return (
    <div className={styles.camp}>
      <div className={styles.content}>
        <h1>⌐◨-◨ Nouns Camp</h1>
        <p>Browse and create Nouns proposals.</p>
        <p className={styles.comingSoon}>Coming Soon</p>
        <div className={styles.features}>
          <h2>Features:</h2>
          <ul>
            <li>Browse active proposals</li>
            <li>View proposal history</li>
            <li>Create new proposals</li>
            <li>Vote with your Nouns</li>
            <li>Real-time proposal status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

