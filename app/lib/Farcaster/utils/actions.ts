/**
 * Farcaster Mini App SDK - Actions Business Logic
 * Pure functions for SDK actions (no React dependencies)
 */

import type {
  OpenUrlOptions,
  ComposeCastOptions,
  ViewProfileOptions,
  ViewCastOptions,
  ViewChannelOptions,
  OpenMiniAppOptions,
  SDKCapability,
  MiniAppSDKError,
} from './types';

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate FID (Farcaster ID)
 */
export function validateFid(fid: number): boolean {
  return Number.isInteger(fid) && fid > 0;
}

/**
 * Validate cast hash format (0x + 40 hex chars)
 */
export function validateCastHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(hash);
}

/**
 * Validate channel key format
 */
export function validateChannelKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 255;
}

/**
 * Check if a capability is supported
 */
export function isCapabilitySupported(
  capability: SDKCapability,
  supportedCapabilities: SDKCapability[]
): boolean {
  return supportedCapabilities.includes(capability);
}

/**
 * Create error for unsupported capability
 */
export function createUnsupportedCapabilityError(
  capability: SDKCapability
): MiniAppSDKError {
  return {
    name: 'UnsupportedCapabilityError',
    message: `Capability '${capability}' is not supported by the current host`,
    code: 'UNSUPPORTED_CAPABILITY',
    details: { capability },
  } as MiniAppSDKError;
}

/**
 * Validate open URL options
 */
export function validateOpenUrlOptions(options: OpenUrlOptions): {
  valid: boolean;
  error?: string;
} {
  if (!options.url) {
    return { valid: false, error: 'URL is required' };
  }
  
  if (!validateUrl(options.url)) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  return { valid: true };
}

/**
 * Validate compose cast options
 */
export function validateComposeCastOptions(options: ComposeCastOptions): {
  valid: boolean;
  error?: string;
} {
  if (options.text && options.text.length > 320) {
    return { valid: false, error: 'Text exceeds maximum length of 320 characters' };
  }
  
  if (options.embeds && options.embeds.length > 2) {
    return { valid: false, error: 'Maximum 2 embeds allowed' };
  }
  
  if (options.embeds) {
    for (const embed of options.embeds) {
      if (!validateUrl(embed)) {
        return { valid: false, error: `Invalid embed URL: ${embed}` };
      }
    }
  }
  
  if (options.channelKey && !validateChannelKey(options.channelKey)) {
    return { valid: false, error: 'Invalid channel key format' };
  }
  
  return { valid: true };
}

/**
 * Validate view profile options
 */
export function validateViewProfileOptions(options: ViewProfileOptions): {
  valid: boolean;
  error?: string;
} {
  if (!validateFid(options.fid)) {
    return { valid: false, error: 'Invalid FID' };
  }
  
  return { valid: true };
}

/**
 * Validate view cast options
 */
export function validateViewCastOptions(options: ViewCastOptions): {
  valid: boolean;
  error?: string;
} {
  if (!validateCastHash(options.hash)) {
    return { valid: false, error: 'Invalid cast hash format' };
  }
  
  return { valid: true };
}

/**
 * Validate view channel options
 */
export function validateViewChannelOptions(options: ViewChannelOptions): {
  valid: boolean;
  error?: string;
} {
  if (!validateChannelKey(options.channelKey)) {
    return { valid: false, error: 'Invalid channel key format' };
  }
  
  return { valid: true };
}

/**
 * Validate open mini app options
 */
export function validateOpenMiniAppOptions(options: OpenMiniAppOptions): {
  valid: boolean;
  error?: string;
} {
  if (!options.url) {
    return { valid: false, error: 'URL is required' };
  }
  
  if (!validateUrl(options.url)) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  // Validate data if provided
  if (options.data) {
    try {
      JSON.stringify(options.data);
    } catch {
      return { valid: false, error: 'Data must be JSON-serializable' };
    }
  }
  
  return { valid: true };
}

/**
 * Serialize Mini App data for URL passing
 */
export function serializeMiniAppData(data: Record<string, unknown>): string {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    throw new Error('Failed to serialize Mini App data');
  }
}

/**
 * Deserialize Mini App data from URL
 */
export function deserializeMiniAppData(encoded: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(encoded));
  } catch (error) {
    throw new Error('Failed to deserialize Mini App data');
  }
}

/**
 * Build Mini App URL with data
 */
export function buildMiniAppUrl(
  baseUrl: string,
  data?: Record<string, unknown>
): string {
  if (!data) return baseUrl;
  
  const url = new URL(baseUrl);
  url.searchParams.set('miniAppData', serializeMiniAppData(data));
  return url.toString();
}

/**
 * Extract Mini App data from URL
 */
export function extractMiniAppData(url: string): Record<string, unknown> | null {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get('miniAppData');
    
    if (!encoded) return null;
    
    return deserializeMiniAppData(encoded);
  } catch {
    return null;
  }
}

/**
 * Truncate text for cast preview
 */
export function truncateCastText(text: string, maxLength: number = 320): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format channel key for display
 */
export function formatChannelKey(key: string): string {
  return key.replace(/^\//, '').toLowerCase();
}

/**
 * Parse channel key from various formats
 */
export function parseChannelKey(input: string): string {
  // Remove leading slash if present
  let key = input.trim();
  if (key.startsWith('/')) {
    key = key.substring(1);
  }
  
  // Handle URLs like farcaster.xyz/~/channel/channelname
  const channelMatch = key.match(/\/channel\/([^/?]+)/);
  if (channelMatch) {
    key = channelMatch[1];
  }
  
  return formatChannelKey(key);
}

/**
 * Check if running in Mini App environment (client-side only)
 */
export function checkIsMiniAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check various indicators
  const isFarcasterFrame = window.self !== window.top;
  const hasFarcasterUserAgent = navigator.userAgent.includes('Farcaster');
  const hasFarcasterReferrer = !!document.referrer.match(/warpcast|farcaster/i);
  const hasMiniAppParam = window.location.search.includes('miniapp=true');
  
  return isFarcasterFrame || hasFarcasterUserAgent || hasFarcasterReferrer || hasMiniAppParam;
}

/**
 * Get Mini App launch context from URL
 */
export function getMiniAppLaunchContext(): {
  fromCast?: string;
  fromChannel?: string;
  fromProfile?: number;
  data?: Record<string, unknown>;
} {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  
  return {
    fromCast: params.get('fc_cast_hash') || undefined,
    fromChannel: params.get('fc_channel') || undefined,
    fromProfile: params.get('fc_fid') ? parseInt(params.get('fc_fid')!) : undefined,
    data: extractMiniAppData(window.location.href) || undefined,
  };
}

/**
 * Calculate approximate cast character count
 * (accounts for URL shortening, mentions, etc.)
 */
export function calculateCastLength(text: string, embeds: string[] = []): number {
  let length = text.length;
  
  // Count embeds (each embed ~23 chars when shortened)
  length += embeds.length * 23;
  
  // Account for mentions (@username format)
  const mentions = text.match(/@\w+/g) || [];
  mentions.forEach(mention => {
    // Mentions are not counted against character limit in some clients
    // Adjust based on your implementation needs
  });
  
  return length;
}

/**
 * Check if cast exceeds length limit
 */
export function isCastTooLong(text: string, embeds: string[] = []): boolean {
  return calculateCastLength(text, embeds) > 320;
}

