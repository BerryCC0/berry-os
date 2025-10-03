/**
 * Gesture System Types
 * Mobile touch gesture handling
 */

export type GestureType =
  | 'tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'edge-swipe';

export interface GestureConfig {
  longPressDelay?: number; // ms, default 500
  swipeThreshold?: number; // px, default 50
  swipeVelocityThreshold?: number; // px/ms, default 0.3
  edgeSwipeWidth?: number; // px, default 20
}

export interface GestureEvent {
  type: GestureType;
  target: HTMLElement | null;
  position: { x: number; y: number };
  velocity?: number;
  distance?: number;
  direction?: 'horizontal' | 'vertical';
  timestamp: number;
}

export interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isLongPress: boolean;
  element: HTMLElement | null;
}

