/**
 * State Utilities
 * Serialization and URL state management for shareable app states
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

/**
 * Serialize app state to compressed URL-safe string
 * Uses LZ-String compression for 50-70% size reduction
 * @param state - Any JSON-serializable state object
 * @returns Compressed and URL-encoded state string
 */
export function serializeState<T>(state: T): string {
  try {
    const json = JSON.stringify(state);
    // Use LZ-String compression - optimized for URLs
    const compressed = compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error('Failed to serialize state:', error);
    return '';
  }
}

/**
 * Deserialize compressed string to app state
 * @param encoded - Compressed and URL-encoded state string
 * @returns Deserialized state object or null if invalid
 */
export function deserializeState<T>(encoded: string): T | null {
  try {
    // Decompress from LZ-String format
    const json = decompressFromEncodedURIComponent(encoded);
    
    if (!json) {
      // Fallback: Try old base64 format for backward compatibility
      try {
        const legacyJson = atob(encoded);
        return JSON.parse(legacyJson) as T;
      } catch {
        return null;
      }
    }
    
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to deserialize state:', error);
    return null;
  }
}

/**
 * Get current URL search params
 */
export function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Update URL without page reload (shallow routing)
 * @param params - URLSearchParams to set
 */
export function updateURL(params: URLSearchParams): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.search = params.toString();
  
  window.history.pushState({}, '', url.toString());
}

/**
 * Get app state from URL query params
 * Uses per-app state keys: state_calculator, state_finder, etc.
 * Falls back to legacy 'state' param for backward compatibility
 * @param appId - The app identifier
 * @returns Deserialized state or null
 */
export function getStateFromURL<T>(appId: string): T | null {
  const params = getSearchParams();
  
  // Try new per-app state format
  const appStateParam = params.get(`state_${appId}`);
  if (appStateParam) {
    return deserializeState<T>(appStateParam);
  }
  
  // Fall back to legacy global state (for backward compatibility)
  const legacyStateParam = params.get('state');
  if (legacyStateParam) {
    return deserializeState<T>(legacyStateParam);
  }
  
  return null;
}

/**
 * Set app state in URL query params
 * Uses per-app state keys: state_calculator, state_finder, etc.
 * @param appId - The app identifier
 * @param state - State to serialize and store
 * @param updateApps - Whether to add app to apps list (default: true)
 */
export function setStateInURL<T>(appId: string, state: T, updateApps = true): void {
  const params = getSearchParams();
  const encoded = serializeState(state);
  
  if (encoded) {
    // Set per-app state
    params.set(`state_${appId}`, encoded);
    
    // Clean up legacy global state param if it exists
    params.delete('state');
    
    // Add app to apps list if requested
    if (updateApps) {
      const apps = params.get('apps') || '';
      const appList = apps.split(',').filter(Boolean);
      if (!appList.includes(appId)) {
        appList.push(appId);
        params.set('apps', appList.join(','));
      }
    }
    
    updateURL(params);
  }
}

/**
 * Remove app state from URL
 * @param appId - The app identifier
 */
export function removeStateFromURL(appId: string): void {
  const params = getSearchParams();
  params.delete(`state_${appId}`);
  
  // Also remove from apps list
  const apps = params.get('apps') || '';
  const appList = apps.split(',').filter(Boolean).filter(id => id !== appId);
  
  if (appList.length > 0) {
    params.set('apps', appList.join(','));
  } else {
    params.delete('apps');
  }
  
  updateURL(params);
}

/**
 * Generate shareable URL for current app state
 * @param appId - The app identifier
 * @param state - State to share
 * @returns Full URL with encoded state
 */
export function generateShareableURL<T>(appId: string, state: T): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin);
  const params = new URLSearchParams();
  
  // Set app
  params.set('apps', appId);
  
  // Set per-app state
  const encoded = serializeState(state);
  if (encoded) {
    params.set(`state_${appId}`, encoded);
  }
  
  url.search = params.toString();
  return url.toString();
}

/**
 * Generate shareable URL with multiple apps and their states
 * @param appStates - Array of {appId, state} objects
 * @returns Full URL with encoded states
 */
export function generateMultiAppURL(appStates: Array<{ appId: string; state?: any }>): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin);
  const params = new URLSearchParams();
  
  const appIds: string[] = [];
  
  appStates.forEach(({ appId, state }) => {
    appIds.push(appId);
    
    if (state) {
      const encoded = serializeState(state);
      if (encoded) {
        params.set(`state_${appId}`, encoded);
      }
    }
  });
  
  if (appIds.length > 0) {
    params.set('apps', appIds.join(','));
  }
  
  url.search = params.toString();
  return url.toString();
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Parse apps list from URL
 * @returns Array of app IDs to open
 */
export function getAppsFromURL(): string[] {
  const params = getSearchParams();
  const apps = params.get('apps');
  
  if (!apps) return [];
  
  return apps.split(',').filter(Boolean);
}

/**
 * Add app to URL apps list (without state)
 * Updates URL to reflect app being opened
 * @param appId - The app identifier
 */
export function addAppToURL(appId: string): void {
  const params = getSearchParams();
  const apps = params.get('apps') || '';
  const appList = apps.split(',').filter(Boolean);
  
  if (!appList.includes(appId)) {
    appList.push(appId);
    params.set('apps', appList.join(','));
    updateURL(params);
  }
}

/**
 * Remove app from URL apps list
 * Updates URL when app is closed
 * @param appId - The app identifier
 */
export function removeAppFromURL(appId: string): void {
  const params = getSearchParams();
  
  // Remove app from apps list
  const apps = params.get('apps') || '';
  const appList = apps.split(',').filter(Boolean).filter(id => id !== appId);
  
  if (appList.length > 0) {
    params.set('apps', appList.join(','));
  } else {
    params.delete('apps');
  }
  
  // Remove app state
  params.delete(`state_${appId}`);
  
  updateURL(params);
}

/**
 * Sync current running apps to URL
 * Useful for keeping URL in sync with system state
 * @param appIds - Array of currently running app IDs
 */
export function syncAppsToURL(appIds: string[]): void {
  if (appIds.length === 0) {
    // Clear apps from URL
    const params = getSearchParams();
    params.delete('apps');
    updateURL(params);
    return;
  }
  
  const params = getSearchParams();
  params.set('apps', appIds.join(','));
  updateURL(params);
}

