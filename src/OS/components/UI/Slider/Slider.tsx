/**
 * Slider Component
 * Mac OS 8 styled horizontal slider with live value display
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Slider.module.css';

export interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  labels?: string[]; // Optional labels for discrete values
  disabled?: boolean;
  id?: string;
  label?: string; // Legacy support - displayed above slider
  showValue?: boolean; // Legacy support - show value display
  className?: string; // Legacy support - additional CSS class
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = '',
  labels,
  disabled = false,
  id,
  label,
  showValue = true,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate percentage for visual display
  const percentage = ((value - min) / (max - min)) * 100;

  // Handle mouse/touch drag
  const handleInteractionStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(clientX);
  };

  const handleInteractionMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    updateValue(clientX);
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const rawValue = (x / rect.width) * (max - min) + min;
    
    // Snap to step
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteractionMove(e.clientX);
    };

    const handleMouseUp = () => {
      handleInteractionEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, disabled]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX);
  };

  const handleTouchEnd = () => {
    handleInteractionEnd();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        onChange(Math.max(min, value - step));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        onChange(Math.min(max, value + step));
        break;
      case 'Home':
        e.preventDefault();
        onChange(min);
        break;
      case 'End':
        e.preventDefault();
        onChange(max);
        break;
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (labels) {
      const index = Math.round(((value - min) / (max - min)) * (labels.length - 1));
      return labels[index] || value;
    }
    return `${value}${unit}`;
  };

  return (
    <div className={className}>
      {label && (
        <label className={styles.label} id={id}>
          {label}
        </label>
      )}
      <div className={`${styles.sliderContainer} ${disabled ? styles.disabled : ''}`}>
        <div
          ref={sliderRef}
          className={styles.sliderTrack}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={String(getDisplayValue())}
          aria-disabled={disabled}
          aria-labelledby={id}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          {/* Filled portion */}
          <div
            className={styles.sliderFill}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={`${styles.sliderThumb} ${isDragging ? styles.dragging : ''}`}
            style={{ left: `${percentage}%` }}
          />
        </div>

        {/* Value display - only show if showValue is true */}
        {showValue && (
          <div className={styles.sliderValue}>
            {getDisplayValue()}
          </div>
        )}
      </div>
    </div>
  );
}
