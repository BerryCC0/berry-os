'use client';

/**
 * Debug App
 * Testing and debugging tools for Nouns OS
 */

import { useState } from 'react';
import { useSystemStore } from '../../../OS/store/systemStore';
import { eventBus } from '../../../OS/lib/eventBus';
import { setStateInURL, removeStateFromURL } from '../../../../app/lib/utils/stateUtils';
import Button from '../../../OS/components/UI/Button/Button';
import styles from './Debug.module.css';

interface DebugProps {
  windowId: string;
}

export default function Debug({ windowId }: DebugProps) {
  const [shouldCrash, setShouldCrash] = useState(false);
  const [crashType, setCrashType] = useState<'immediate' | 'delayed' | 'infinite'>('immediate');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [stateTest, setStateTest] = useState({ counter: 0, text: 'Hello' });

  const runningApps = useSystemStore((state) => state.runningApps);
  const windows = useSystemStore((state) => state.windows);
  const systemVersion = useSystemStore((state) => state.systemVersion);
  const bootTime = useSystemStore((state) => state.bootTime);

  // Crash triggers
  if (shouldCrash) {
    if (crashType === 'immediate') {
      throw new Error('💣 Immediate crash triggered from Debug app!');
    }
  }

  const handleCrash = (type: 'immediate' | 'delayed' | 'infinite') => {
    if (type === 'immediate') {
      setShouldCrash(true);
    } else if (type === 'delayed') {
      setTimeout(() => {
        throw new Error('⏱️ Delayed crash (3 seconds)!');
      }, 3000);
    } else if (type === 'infinite') {
      const recursiveFunction: any = () => recursiveFunction();
      recursiveFunction();
    }
  };

  const handlePublishEvent = () => {
    eventBus.publish('GESTURE', {
      gestureType: 'tap',
      target: 'debug-app',
      position: { x: 100, y: 200 },
    });
    addToLog('Published GESTURE event');
  };

  const handleSubscribeEvents = () => {
    const subscription = eventBus.subscribe('APP_LAUNCH', (payload: any) => {
      addToLog(`APP_LAUNCH: ${payload.appId}`);
    });

    addToLog('Subscribed to APP_LAUNCH events');
    
    // Auto-unsubscribe after 30 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      addToLog('Unsubscribed from APP_LAUNCH events');
    }, 30000);
  };

  const handleStateTest = () => {
    const newState = {
      counter: stateTest.counter + 1,
      text: `Test ${stateTest.counter + 1}`,
    };
    setStateTest(newState);
    setStateInURL('debug', newState);
    addToLog(`State updated: counter=${newState.counter}`);
  };

  const handleClearState = () => {
    removeStateFromURL('debug');
    addToLog('State cleared from URL');
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleClearLog = () => {
    setEventLog([]);
  };

  const handleMemoryLeak = () => {
    const leak: any[] = [];
    const interval = setInterval(() => {
      leak.push(new Array(1000000).fill('memory'));
      addToLog(`Leak size: ${leak.length}MB`);
    }, 100);

    // Auto-stop after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      addToLog('Memory leak stopped');
    }, 5000);
  };

  return (
    <div className={styles.debug}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>🛠️ Debug Console</h1>
          <div className={styles.subtitle}>Nouns OS Testing & Debugging</div>
        </div>

        {/* System Info */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>System Information</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Version:</span>
              <span className={styles.value}>{systemVersion}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Running Apps:</span>
              <span className={styles.value}>{Object.keys(runningApps).length}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Open Windows:</span>
              <span className={styles.value}>{Object.keys(windows).length}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Uptime:</span>
              <span className={styles.value}>
                {Math.floor((Date.now() - bootTime) / 1000 / 60)} min
              </span>
            </div>
          </div>
        </div>

        {/* Crash Tests */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>💥 Crash Tests</div>
          <div className={styles.warning}>
            These will crash this app only. Other apps should keep running!
          </div>
          <div className={styles.buttonRow}>
            <Button
              variant="cancel"
              onClick={() => handleCrash('immediate')}
            >
              💣 Immediate Crash
            </Button>
            <Button
              variant="cancel"
              onClick={() => handleCrash('delayed')}
            >
              ⏱️ Delayed Crash (3s)
            </Button>
            <Button
              variant="cancel"
              onClick={() => handleCrash('infinite')}
            >
              ♾️ Stack Overflow
            </Button>
          </div>
        </div>

        {/* Event Bus Tests */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📡 Event Bus Tests</div>
          <div className={styles.buttonRow}>
            <Button onClick={handlePublishEvent}>
              Publish Event
            </Button>
            <Button onClick={handleSubscribeEvents}>
              Subscribe to APP_LAUNCH
            </Button>
          </div>
        </div>

        {/* State Tests */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🔗 URL State Tests</div>
          <div className={styles.stateDisplay}>
            <div>Counter: {stateTest.counter}</div>
            <div>Text: {stateTest.text}</div>
          </div>
          <div className={styles.buttonRow}>
            <Button onClick={handleStateTest}>
              Update State
            </Button>
            <Button onClick={handleClearState}>
              Clear State
            </Button>
          </div>
        </div>

        {/* Performance Tests */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>⚡ Performance Tests</div>
          <div className={styles.buttonRow}>
            <Button
              variant="cancel"
              onClick={handleMemoryLeak}
            >
              Memory Leak (5s)
            </Button>
            <Button onClick={() => addToLog('Heavy render triggered')}>
              Heavy Render
            </Button>
          </div>
        </div>

        {/* Event Log */}
        <div className={styles.section}>
          <div className={styles.logHeader}>
            <div className={styles.sectionTitle}>📝 Event Log</div>
            <Button size="small" onClick={handleClearLog}>
              Clear
            </Button>
          </div>
          <div className={styles.log}>
            {eventLog.length === 0 ? (
              <div className={styles.logEmpty}>No events logged yet</div>
            ) : (
              eventLog.map((log, index) => (
                <div key={index} className={styles.logEntry}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* App List */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📦 Running Apps</div>
          <div className={styles.appList}>
            {Object.values(runningApps).map((app) => (
              <div key={app.id} className={styles.appItem}>
                <img src={app.config.icon} alt="" className={styles.appIcon} />
                <div className={styles.appInfo}>
                  <div className={styles.appName}>{app.config.name}</div>
                  <div className={styles.appMeta}>
                    {app.windows.length} window{app.windows.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className={styles.appStatus}>
                  {app.state === 'running' ? '🟢' : '🔴'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

