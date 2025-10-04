/**
 * Mobile Utilities
 * Helpers for mobile-specific functionality
 */

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

/**
 * Detect if device is tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get current orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Handle virtual keyboard appearance
 * Returns cleanup function
 */
export function handleVirtualKeyboard(callback: (isVisible: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let initialHeight = window.visualViewport?.height || window.innerHeight;

  const handleResize = () => {
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const heightDiff = initialHeight - currentHeight;
    
    // Keyboard is considered visible if viewport shrunk by more than 150px
    const isKeyboardVisible = heightDiff > 150;
    callback(isKeyboardVisible);
  };

  // Use visualViewport API if available (better for keyboard detection)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport!.removeEventListener('resize', handleResize);
  } else {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }
}

/**
 * Handle orientation changes
 * Returns cleanup function
 */
export function handleOrientationChange(
  callback: (orientation: 'portrait' | 'landscape') => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleChange = () => {
    callback(getOrientation());
  };

  // Listen for both resize and orientationchange events
  window.addEventListener('resize', handleChange);
  window.addEventListener('orientationchange', handleChange);

  return () => {
    window.removeEventListener('resize', handleChange);
    window.removeEventListener('orientationchange', handleChange);
  };
}

/**
 * Prevent bounce/overscroll on iOS
 */
export function preventIOSBounce(): () => void {
  if (typeof document === 'undefined') return () => {};

  const preventDefault = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // Allow scrolling within scrollable elements
    if (target.closest('[data-scrollable]')) return;
    
    // Prevent default on other elements
    if (e.touches.length > 1) return;
    e.preventDefault();
  };

  document.addEventListener('touchmove', preventDefault, { passive: false });

  return () => {
    document.removeEventListener('touchmove', preventDefault);
  };
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-left') || '0'),
  };
}

/**
 * Lock orientation (requires Fullscreen API)
 * Note: This API is experimental and may not work in all browsers
 */
export async function lockOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
  if (typeof screen === 'undefined' || !screen.orientation) return;
  
  try {
    // @ts-ignore - lock API is experimental
    if (screen.orientation.lock) {
      // @ts-ignore
      await screen.orientation.lock(orientation);
    }
  } catch (error) {
    console.warn('Orientation lock not supported:', error);
  }
}

/**
 * Unlock orientation
 */
export function unlockOrientation(): void {
  if (typeof screen === 'undefined' || !screen.orientation) return;
  
  try {
    // @ts-ignore - unlock API is experimental
    if (screen.orientation.unlock) {
      // @ts-ignore
      screen.orientation.unlock();
    }
  } catch (error) {
    console.warn('Orientation unlock not supported:', error);
  }
}

