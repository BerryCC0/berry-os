/**
 * Farcaster Mini App SDK - Context Business Logic
 * Pure functions for user and location context (no React dependencies)
 */

import type {
  FarcasterUser,
  FarcasterLocation,
  MiniAppContext,
} from './types';

/**
 * Validate FID
 */
export function isValidFid(fid: unknown): fid is number {
  return typeof fid === 'number' && Number.isInteger(fid) && fid > 0;
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // Farcaster usernames: 1-16 chars, alphanumeric + hyphens/underscores
  return /^[a-zA-Z0-9_-]{1,16}$/.test(username);
}

/**
 * Format username (ensure @ prefix)
 */
export function formatUsername(username: string): string {
  const clean = username.trim().replace(/^@/, '');
  return `@${clean}`;
}

/**
 * Parse username (remove @ prefix)
 */
export function parseUsername(username: string): string {
  return username.replace(/^@/, '');
}

/**
 * Validate Farcaster URL format
 */
export function isFarcasterUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('warpcast.com') || 
           urlObj.hostname.includes('farcaster.xyz');
  } catch {
    return false;
  }
}

/**
 * Extract FID from Farcaster URL
 */
export function extractFidFromUrl(url: string): number | null {
  try {
    const urlObj = new URL(url);
    
    // warpcast.com/username pattern
    const usernameMatch = urlObj.pathname.match(/^\/([^/]+)$/);
    if (usernameMatch) {
      // Can't extract FID from username alone
      return null;
    }
    
    // Look for fid in query params
    const fid = urlObj.searchParams.get('fid');
    if (fid) {
      const fidNum = parseInt(fid);
      return isValidFid(fidNum) ? fidNum : null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Build profile URL from FID
 */
export function buildProfileUrl(fid: number): string {
  return `https://warpcast.com/~/profiles/${fid}`;
}

/**
 * Build profile URL from username
 */
export function buildProfileUrlFromUsername(username: string): string {
  const clean = parseUsername(username);
  return `https://warpcast.com/${clean}`;
}

/**
 * Build cast URL from hash
 */
export function buildCastUrl(hash: string): string {
  return `https://warpcast.com/~/conversations/${hash}`;
}

/**
 * Build channel URL from key
 */
export function buildChannelUrl(channelKey: string): string {
  const clean = channelKey.replace(/^\//, '');
  return `https://warpcast.com/~/channel/${clean}`;
}

/**
 * Determine location type from URL or context
 */
export function inferLocationType(context: {
  castHash?: string;
  channelKey?: string;
  profileFid?: number;
  referrer?: string;
}): FarcasterLocation['type'] {
  if (context.castHash) return 'cast';
  if (context.channelKey) return 'channel';
  if (context.profileFid) return 'profile';
  
  if (context.referrer) {
    if (context.referrer.includes('/conversations/')) return 'cast';
    if (context.referrer.includes('/channel/')) return 'channel';
    if (context.referrer.includes('/~/profiles/')) return 'profile';
    if (context.referrer.includes('/notifications')) return 'notification';
  }
  
  return 'unknown';
}

/**
 * Parse location from URL parameters
 */
export function parseLocationFromUrl(url: string): Partial<FarcasterLocation> {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    const location: Partial<FarcasterLocation> = {};
    
    // Check for cast context
    const castHash = params.get('fc_cast_hash');
    if (castHash) {
      location.type = 'cast';
      location.castHash = castHash;
    }
    
    // Check for channel context
    const channel = params.get('fc_channel');
    if (channel) {
      location.type = 'channel';
      location.channelKey = channel;
    }
    
    // Check for profile context
    const fid = params.get('fc_fid');
    if (fid) {
      const fidNum = parseInt(fid);
      if (isValidFid(fidNum)) {
        location.type = 'profile';
        location.profileFid = fidNum;
      }
    }
    
    // Infer from pathname if no params
    if (!location.type) {
      const pathname = urlObj.pathname;
      
      if (pathname.includes('/conversations/')) {
        location.type = 'cast';
        const hashMatch = pathname.match(/\/conversations\/([^/]+)/);
        if (hashMatch) location.castHash = hashMatch[1];
      } else if (pathname.includes('/channel/')) {
        location.type = 'channel';
        const channelMatch = pathname.match(/\/channel\/([^/]+)/);
        if (channelMatch) location.channelKey = channelMatch[1];
      } else if (pathname.includes('/~/profiles/')) {
        location.type = 'profile';
        const fidMatch = pathname.match(/\/profiles\/(\d+)/);
        if (fidMatch) location.profileFid = parseInt(fidMatch[1]);
      }
    }
    
    if (!location.type) {
      location.type = 'unknown';
    }
    
    return location;
  } catch {
    return { type: 'unknown' };
  }
}

/**
 * Check if user has verified Ethereum address
 */
export function hasVerifiedEthAddress(user: FarcasterUser): boolean {
  return !!user.verifications && user.verifications.length > 0;
}

/**
 * Get primary verified address
 */
export function getPrimaryVerification(user: FarcasterUser): string | null {
  if (!user.verifications || user.verifications.length === 0) {
    return null;
  }
  return user.verifications[0];
}

/**
 * Get all verified addresses
 */
export function getAllVerifications(user: FarcasterUser): string[] {
  return user.verifications || [];
}

/**
 * Format display name (fallback to username or FID)
 */
export function getDisplayName(user: FarcasterUser): string {
  if (user.displayName) return user.displayName;
  if (user.username) return formatUsername(user.username);
  return `fid:${user.fid}`;
}

/**
 * Get user identifier (prefer username, fallback to FID)
 */
export function getUserIdentifier(user: FarcasterUser): string {
  return user.username || `fid:${user.fid}`;
}

/**
 * Build user mention string
 */
export function buildMention(user: FarcasterUser): string {
  return user.username ? formatUsername(user.username) : `fid:${user.fid}`;
}

/**
 * Check if two users are the same
 */
export function isSameUser(user1: FarcasterUser, user2: FarcasterUser): boolean {
  return user1.fid === user2.fid;
}

/**
 * Validate Mini App context
 */
export function isValidContext(context: unknown): context is MiniAppContext {
  if (!context || typeof context !== 'object') return false;
  
  const ctx = context as Record<string, unknown>;
  
  // Check user
  if (!ctx.user || typeof ctx.user !== 'object') return false;
  const user = ctx.user as Record<string, unknown>;
  if (!isValidFid(user.fid)) return false;
  
  // Check location
  if (!ctx.location || typeof ctx.location !== 'object') return false;
  const location = ctx.location as Record<string, unknown>;
  if (typeof location.type !== 'string') return false;
  
  return true;
}

/**
 * Create default context (for testing/fallback)
 */
export function createDefaultContext(overrides?: Partial<MiniAppContext>): MiniAppContext {
  return {
    user: {
      fid: 0,
      username: 'unknown',
      displayName: 'Unknown User',
      pfpUrl: undefined,
      custody: undefined,
      verifications: [],
      ...overrides?.user,
    },
    location: {
      type: 'unknown',
      ...overrides?.location,
    },
  };
}

/**
 * Serialize context for storage/sharing
 */
export function serializeContext(context: MiniAppContext): string {
  try {
    return JSON.stringify(context);
  } catch {
    throw new Error('Failed to serialize context');
  }
}

/**
 * Deserialize context from storage/sharing
 */
export function deserializeContext(serialized: string): MiniAppContext {
  try {
    const context = JSON.parse(serialized);
    if (!isValidContext(context)) {
      throw new Error('Invalid context format');
    }
    return context;
  } catch {
    throw new Error('Failed to deserialize context');
  }
}

/**
 * Get context summary for logging/debugging
 */
export function getContextSummary(context: MiniAppContext): string {
  const user = getDisplayName(context.user);
  const location = context.location.type;
  
  let details = '';
  if (context.location.castHash) {
    details = ` (cast: ${context.location.castHash.substring(0, 10)}...)`;
  } else if (context.location.channelKey) {
    details = ` (channel: ${context.location.channelKey})`;
  } else if (context.location.profileFid) {
    details = ` (profile: ${context.location.profileFid})`;
  }
  
  return `${user} from ${location}${details}`;
}

/**
 * Check if context is from a specific location type
 */
export function isFromCast(context: MiniAppContext): boolean {
  return context.location.type === 'cast';
}

export function isFromChannel(context: MiniAppContext): boolean {
  return context.location.type === 'channel';
}

export function isFromProfile(context: MiniAppContext): boolean {
  return context.location.type === 'profile';
}

export function isFromDirectMessage(context: MiniAppContext): boolean {
  return context.location.type === 'direct_message';
}

/**
 * Extract channel key from location
 */
export function getChannelKey(location: FarcasterLocation): string | null {
  return location.type === 'channel' ? location.channelKey || null : null;
}

/**
 * Extract cast hash from location
 */
export function getCastHash(location: FarcasterLocation): string | null {
  return location.type === 'cast' ? location.castHash || null : null;
}

/**
 * Extract profile FID from location
 */
export function getProfileFid(location: FarcasterLocation): number | null {
  return location.type === 'profile' ? location.profileFid || null : null;
}

