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
 * @param appId - The app identifier
 * @returns Deserialized state or null
 */
export function getStateFromURL<T>(appId: string): T | null {
  const params = getSearchParams();
  const stateParam = params.get('state');
  
  if (!stateParam) return null;
  
  return deserializeState<T>(stateParam);
}

/**
 * Set app state in URL query params
 * @param appId - The app identifier
 * @param state - State to serialize and store
 */
export function setStateInURL<T>(appId: string, state: T): void {
  const params = getSearchParams();
  const encoded = serializeState(state);
  
  if (encoded) {
    params.set('state', encoded);
    
    // Also ensure the app is in the apps list
    const apps = params.get('apps') || '';
    if (!apps.split(',').includes(appId)) {
      params.set('apps', apps ? `${apps},${appId}` : appId);
    }
    
    updateURL(params);
  }
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
  
  // Set state
  const encoded = serializeState(state);
  if (encoded) {
    params.set('state', encoded);
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

