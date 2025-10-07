/**
 * VolumeControl Component
 * System overlay for volume/brightness controls
 * Appears when volume/brightness keys are pressed
 */

import { useEffect, useState } from 'react';
import Slider from '../Slider/Slider';
import styles from './VolumeControl.module.css';

export type ControlType = 'volume' | 'brightness';

export interface VolumeControlProps {
  type: ControlType;
  value: number; // 0-100
  onChange: (value: number) => void;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDelay?: number; // ms
}

export default function VolumeControl({
  type,
  value,
  onChange,
  onClose,
  autoHide = true,
  autoHideDelay = 2000,
}: VolumeControlProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 200); // Wait for fade out
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const getIcon = () => {
    if (type === 'volume') {
      if (value === 0) return '🔇';
      if (value < 33) return '🔈';
      if (value < 66) return '🔉';
      return '🔊';
    } else {
      if (value < 33) return '🌑';
      if (value < 66) return '🌓';
      return '☀️';
    }
  };

  const getLabel = () => {
    return type === 'volume' ? 'Volume' : 'Brightness';
  };

  return (
    <div className={`${styles.overlay} ${!visible ? styles.fadeOut : ''}`}>
      <div className={styles.control}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.sliderContainer}>
          <div className={styles.label}>{getLabel()}</div>
          <Slider
            value={value}
            min={0}
            max={100}
            onChange={onChange}
            showValue
          />
        </div>
      </div>
    </div>
  );
}

