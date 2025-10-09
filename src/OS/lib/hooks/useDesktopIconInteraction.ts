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
  // Desktop preferences (Phase 7)
  snapToGrid?: boolean;
  gridSpacing?: number;
  doubleClickSpeed?: 'slow' | 'medium' | 'fast';
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
  snapToGrid = false,
  gridSpacing = 80,
  doubleClickSpeed = 'medium',
}: DesktopIconInteractionOptions): DesktopIconInteractionState {
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  const lastClickTime = useRef<number>(0);
  const lastClickedIconId = useRef<string | null>(null);

  // Get double-click timeout based on speed setting
  const getDoubleClickTimeout = () => {
    switch (doubleClickSpeed) {
      case 'slow': return 500;
      case 'fast': return 200;
      default: return 300; // medium
    }
  };

  // Snap position to grid if enabled
  const snapPositionToGrid = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    return {
      x: Math.round(x / gridSpacing) * gridSpacing,
      y: Math.round(y / gridSpacing) * gridSpacing,
    };
  };

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
      const icon = icons.find((i) => i.id === draggingIconId);
      
      // If we didn't drag (quick tap/click), handle click/double-click
      if (!isDragging && icon) {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime.current;
        const doubleClickTimeout = getDoubleClickTimeout();
        
        // Check for double-click on same icon
        if (
          lastClickedIconId.current === draggingIconId &&
          timeSinceLastClick < doubleClickTimeout
        ) {
          // Double-click detected - open the app
          onIconClick(icon);
          lastClickTime.current = 0;
          lastClickedIconId.current = null;
        } else {
          // Single click - just select (future: could highlight icon)
          lastClickTime.current = currentTime;
          lastClickedIconId.current = draggingIconId;
          
          // On mobile, single tap opens immediately
          if (isMobile) {
            onIconClick(icon);
          }
        }
      } else if (isDragging && draggingIconId && icon) {
        // Icon was dragged - apply snap-to-grid if enabled
        const snappedPosition = snapPositionToGrid(icon.position.x, icon.position.y);
        
        if (snappedPosition.x !== icon.position.x || snappedPosition.y !== icon.position.y) {
          onIconMove(draggingIconId, snappedPosition.x, snappedPosition.y);
        }
        
        // Save position if wallet is connected
        if (connectedWallet) {
          onIconPositionsSave();
        }
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
    snapToGrid,
    gridSpacing,
    doubleClickSpeed,
  ]);

  return {
    draggingIconId,
    isDragging,
    handleIconDragStart,
  };
}

