/**
 * useDeviceDetection Hook
 * Business logic for detecting device type, orientation, and virtual keyboard
 */

import { useState, useEffect } from 'react';
import {
  isMobileDevice,
  isTabletDevice,
  getOrientation,
  handleVirtualKeyboard,
  handleOrientationChange,
} from '../mobileUtils';

export interface DeviceState {
  isMobile: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
  isKeyboardVisible: boolean;
}

/**
 * Hook to detect and track device characteristics
 * Handles mobile/tablet detection, orientation, and virtual keyboard
 */
export function useDeviceDetection(): DeviceState {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Detect device type and orientation
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobileDevice());
      setIsTablet(isTabletDevice());
      setOrientation(getOrientation());
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Handle virtual keyboard
  useEffect(() => {
    const cleanup = handleVirtualKeyboard((isVisible) => {
      setIsKeyboardVisible(isVisible);

      // Add class to body when keyboard is visible
      if (isVisible) {
        document.body.classList.add('keyboard-visible');
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    });

    return cleanup;
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const cleanup = handleOrientationChange((newOrientation) => {
      setOrientation(newOrientation);

      // Log orientation changes on mobile
      if (isMobile) {
        console.log('Orientation changed to:', newOrientation);
      }
    });

    return cleanup;
  }, [isMobile]);

  return {
    isMobile,
    isTablet,
    orientation,
    isKeyboardVisible,
  };
}

