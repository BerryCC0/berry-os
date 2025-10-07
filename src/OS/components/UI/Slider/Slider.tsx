/**
 * Slider Component
 * System Preferences (volume, brightness, etc.)
 */

import { useState, useRef } from 'react';
import styles from './Slider.module.css';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = false,
  disabled = false,
  label,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !disabled) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = min + percent * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  // Attach global mouse listeners when dragging
  if (typeof window !== 'undefined') {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.sliderWrapper}>
        <div
          ref={sliderRef}
          className={styles.slider}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.track} />
          <div
            className={styles.fill}
            style={{ width: `${percentage}%` }}
          />
          <div
            className={styles.thumb}
            style={{ left: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className={styles.valueDisplay}>{value}</div>
        )}
      </div>
    </div>
  );
}

