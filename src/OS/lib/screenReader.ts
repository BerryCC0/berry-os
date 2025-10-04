/**
 * Screen Reader Announcements
 * Utility for making announcements to screen readers
 */

/**
 * Announce a message to screen readers
 * Uses ARIA live regions for dynamic content
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  // Find or create the announcement container
  let container = document.getElementById('sr-announcer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'sr-announcer';
    container.className = 'sr-only';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', priority);
    container.setAttribute('aria-atomic', 'true');
    
    // Visually hidden but accessible to screen readers
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.overflow = 'hidden';
    
    document.body.appendChild(container);
  }
  
  // Update the aria-live priority if needed
  container.setAttribute('aria-live', priority);
  
  // Clear and set new message
  container.textContent = '';
  
  // Delay slightly to ensure screen readers pick up the change
  setTimeout(() => {
    if (container) {
      container.textContent = message;
    }
  }, 100);
}

/**
 * Announce window opened
 */
export function announceWindowOpen(appName: string): void {
  announce(`${appName} window opened`, 'polite');
}

/**
 * Announce window closed
 */
export function announceWindowClosed(appName: string): void {
  announce(`${appName} window closed`, 'polite');
}

/**
 * Announce window minimized
 */
export function announceWindowMinimized(appName: string): void {
  announce(`${appName} window minimized`, 'polite');
}

/**
 * Announce window restored
 */
export function announceWindowRestored(appName: string): void {
  announce(`${appName} window restored`, 'polite');
}

/**
 * Announce window maximized
 */
export function announceWindowMaximized(appName: string): void {
  announce(`${appName} window maximized`, 'polite');
}

/**
 * Announce app launched
 */
export function announceAppLaunched(appName: string): void {
  announce(`${appName} launched`, 'polite');
}

/**
 * Announce app terminated
 */
export function announceAppTerminated(appName: string): void {
  announce(`${appName} closed`, 'polite');
}

/**
 * Announce error
 */
export function announceError(message: string): void {
  announce(`Error: ${message}`, 'assertive');
}

/**
 * Announce success
 */
export function announceSuccess(message: string): void {
  announce(message, 'polite');
}

