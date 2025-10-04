'use client';

/**
 * TouchTarget Component
 * Wraps elements to ensure 44px minimum touch target size
 * Provides haptic feedback and long-press support
 */

import { useState, useRef, useEffect } from 'react';
import styles from './TouchTarget.module.css';

interface TouchTargetProps {
  children: React.ReactNode;
  minSize?: number; // Default: 44px
  haptic?: boolean; // Haptic feedback on tap
  longPress?: () => void; // Long-press handler
  onTap?: () => void; // Tap handler
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function TouchTarget({
  children,
  minSize = 44,
  haptic = false,
  longPress,
  onTap,
  disabled = false,
  className = '',
  ariaLabel,
}: TouchTargetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const triggerHaptic = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsPressed(true);

    // Start long press timer
    if (longPress) {
      longPressTimerRef.current = setTimeout(() => {
        triggerHaptic();
        longPress();
        setIsPressed(false);
      }, 500); // 500ms for long press
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPosRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel if moved too far (> 10px)
    if (distance > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setIsPressed(false);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;

      // Was a tap, not a long press
      if (onTap) {
        triggerHaptic();
        onTap();
      }
    }

    setIsPressed(false);
    startPosRef.current = null;
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressed(false);
    startPosRef.current = null;
  };

  // Mouse fallback for desktop
  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
    if (onTap) {
      onTap();
    }
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <div
      className={`${styles.touchTarget} ${isPressed ? styles.pressed : ''} ${disabled ? styles.disabled : ''} ${className}`}
      style={{
        minWidth: minSize,
        minHeight: minSize,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      role={onTap || longPress ? 'button' : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

