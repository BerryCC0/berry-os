/**
 * useDesktopIconInteraction Hook
 * Business logic for desktop icon dragging and clicking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DesktopIcon } from '../../types/system';

export interface DesktopIconInteractionOptions {
  icons: DesktopIcon[];
  isMobile: boolean;
  connectedWallet: string | null;
  onIconClick: (icon: DesktopIcon) => void;
  onIconMove: (iconId: string, x: number, y: number) => void;
  onIconPositionsSave: () => void;
}

export interface DesktopIconInteractionState {
  draggingIconId: string | null;
  isDragging: boolean;
  handleIconDragStart: (e: React.MouseEvent | React.TouchEvent, iconId: string) => void;
}

/**
 * Hook to handle desktop icon drag-and-drop and click interactions
 * Pure business logic - no UI rendering
 */
export function useDesktopIconInteraction({
  icons,
  isMobile,
  connectedWallet,
  onIconClick,
  onIconMove,
  onIconPositionsSave,
}: DesktopIconInteractionOptions): DesktopIconInteractionState {
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);

  const handleIconDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, iconId: string) => {
      e.preventDefault();
      const icon = icons.find((i) => i.id === iconId);
      if (!icon) return;

      dragStartTime.current = Date.now();
      setIsDragging(false);
      setDraggingIconId(iconId);

      // Handle both mouse and touch events
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      setDragOffset({
        x: clientX - icon.position.x,
        y: clientY - icon.position.y,
      });
    },
    [icons]
  );

  // Handle icon dragging (mouse and touch)
  useEffect(() => {
    if (!draggingIconId) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      // If we've moved, consider it a drag
      setIsDragging(true);

      // Get client coordinates from mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // Keep within desktop bounds
      const minX = 0;
      // Account for menu bar (20px desktop) or mobile nav (44px mobile)
      const minY = isMobile ? 44 : 20;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - 80 : 1920;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 1080;

      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      // Smooth, free-form positioning (no grid snap)
      onIconMove(draggingIconId, clampedX, clampedY);
    };

    const handleEnd = () => {
      // If we didn't drag (quick tap/click), open the app
      if (!isDragging) {
        const icon = icons.find((i) => i.id === draggingIconId);
        if (icon) {
          onIconClick(icon);
        }
      } else if (connectedWallet) {
        // Icon was dragged and wallet is connected - save position
        onIconPositionsSave();
      }

      setDraggingIconId(null);
      setIsDragging(false);
    };

    // Add both mouse and touch listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [
    draggingIconId,
    dragOffset,
    isDragging,
    icons,
    onIconMove,
    onIconClick,
    isMobile,
    connectedWallet,
    onIconPositionsSave,
  ]);

  return {
    draggingIconId,
    isDragging,
    handleIconDragStart,
  };
}

