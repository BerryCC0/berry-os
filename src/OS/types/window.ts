/**
 * Window System Types
 * Mac OS 8 window management
 */

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowPosition, WindowSize {}

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface Window {
  id: string;
  appId: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  state: WindowState;
  zIndex: number;
  isActive: boolean;
  isResizable: boolean;
  minSize?: WindowSize;
  maxSize?: WindowSize;
  metadata?: Record<string, unknown>;
}

export interface WindowConfig {
  appId: string;
  title: string;
  defaultSize: WindowSize;
  minSize?: WindowSize;
  maxSize?: WindowSize;
  resizable: boolean;
  initialPosition?: WindowPosition;
}

