/**
 * MobileAppSwitcher Component
 * Swipe-up card interface for mobile app switching
 * iOS-style app cards
 */

import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import styles from './MobileAppSwitcher.module.css';

export interface MobileAppSwitcherProps {
  onClose: () => void;
  onSelect: (appId: string) => void;
  onKill: (appId: string) => void;
}

export default function MobileAppSwitcher({
  onClose,
  onSelect,
  onKill,
}: MobileAppSwitcherProps) {
  const runningApps = useSystemStore((state) => state.runningApps);
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);

  const apps = Object.values(runningApps);

  // Handle swipe down to close
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(`.${styles.card}`)) return;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(`.${styles.card}`)) return;
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 0) {
        setDragOffset(deltaY);
      }
    };

    const handleTouchEnd = () => {
      if (dragOffset > 100) {
        onClose();
      }
      setDragOffset(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragOffset, onClose]);

  const handleCardSwipe = (appId: string, deltaX: number) => {
    if (Math.abs(deltaX) > 100) {
      // Swipe to kill
      onKill(appId);
      setDraggedApp(null);
    }
  };

  return (
    <div
      className={styles.overlay}
      style={{
        transform: `translateY(${dragOffset}px)`,
      }}
    >
      <div className={styles.handle} />
      <div className={styles.title}>Running Applications</div>
      <div className={styles.cards}>
        {apps.length === 0 ? (
          <div className={styles.empty}>No running applications</div>
        ) : (
          apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onSelect={() => {
                onSelect(app.id);
                onClose();
              }}
              onKill={() => onKill(app.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AppCardProps {
  app: any;
  onSelect: () => void;
  onKill: () => void;
}

function AppCard({ app, onSelect, onKill }: AppCardProps) {
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;
    setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 100) {
      // Swipe to kill
      onKill();
    } else {
      // Snap back
      setDragX(0);
    }
  };

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        transform: `translateX(${dragX}px)`,
        opacity: 1 - Math.abs(dragX) / 300,
      }}
      onClick={onSelect}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.cardHeader}>
        <img
          src={app.config.icon}
          alt=""
          className={styles.cardIcon}
          onError={(e) => {
            e.currentTarget.src = '/icons/system/placeholder.svg';
          }}
        />
        <div className={styles.cardName}>{app.config.name}</div>
        <button
          className={styles.killButton}
          onClick={(e) => {
            e.stopPropagation();
            onKill();
          }}
        >
          ×
        </button>
      </div>
      <div className={styles.cardPreview}>
        {/* Placeholder for app preview */}
        <div className={styles.previewPlaceholder}>
          {app.config.name}
        </div>
      </div>
    </div>
  );
}

