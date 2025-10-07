/**
 * Tooltip Component
 * Hover tooltips for icons, buttons, truncated text
 */

import { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // ms before showing (default: 500)
  disabled?: boolean;
  children: React.ReactNode;
}

export default function Tooltip({
  content,
  position = 'top',
  delay = 500,
  disabled = false,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={styles.container}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {visible && (
        <div
          className={`${styles.tooltip} ${styles[position]}`}
          style={{
            left: coords.x,
            top: coords.y,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

