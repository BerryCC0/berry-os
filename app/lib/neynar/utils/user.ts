/**
 * Neynar API - User Business Logic
 * Pure functions for user operations (no React dependencies)
 */

import type {
  FarcasterUser,
  FID,
  ValidationResult,
} from './types';

/**
 * Validate FID (Farcaster ID)
 */
export function isValidFID(fid: unknown): fid is number {
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
 * Format username with @ prefix
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
 * Get user display name with fallback
 */
export function getUserDisplayName(user: FarcasterUser): string {
  return user.displayName || user.username || `User ${user.fid}`;
}

/**
 * Get user identifier (username or FID)
 */
export function getUserIdentifier(user: FarcasterUser): string {
  return user.username || `fid:${user.fid}`;
}

/**
 * Build user mention string
 */
export function buildUserMention(user: FarcasterUser): string {
  return user.username ? formatUsername(user.username) : `fid:${user.fid}`;
}

/**
 * Check if user has verified address
 */
export function hasVerifications(user: FarcasterUser): boolean {
  return !!(user.verifications && user.verifications.length > 0);
}

/**
 * Get primary verification address
 */
export function getPrimaryVerification(user: FarcasterUser): string | null {
  return user.verifications?.[0] || null;
}

/**
 * Check if user is active
 */
export function isActiveUser(user: FarcasterUser): boolean {
  return user.activeStatus === 'active';
}

/**
 * Format follower count
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Calculate follower ratio
 */
export function calculateFollowerRatio(user: FarcasterUser): number {
  if (!user.followerCount || !user.followingCount) return 0;
  if (user.followingCount === 0) return user.followerCount;
  return user.followerCount / user.followingCount;
}

/**
 * Check if user has high engagement (ratio > 2)
 */
export function hasHighEngagement(user: FarcasterUser): boolean {
  return calculateFollowerRatio(user) > 2;
}

/**
 * Get user bio text
 */
export function getUserBio(user: FarcasterUser): string {
  return user.profile?.bio?.text || '';
}

/**
 * Get bio mentions
 */
export function getBioMentions(user: FarcasterUser): string[] {
  return user.profile?.bio?.mentions || [];
}

/**
 * Format user profile for display
 */
export function formatUserProfile(user: FarcasterUser): string {
  const name = getUserDisplayName(user);
  const username = user.username ? formatUsername(user.username) : `fid:${user.fid}`;
  const followers = user.followerCount ? formatFollowerCount(user.followerCount) : '0';
  
  return `${name} (${username}) • ${followers} followers`;
}

/**
 * Compare users by follower count
 */
export function compareByFollowers(a: FarcasterUser, b: FarcasterUser): number {
  const aFollowers = a.followerCount || 0;
  const bFollowers = b.followerCount || 0;
  return bFollowers - aFollowers; // Descending order
}

/**
 * Compare users by activity
 */
export function compareByActivity(a: FarcasterUser, b: FarcasterUser): number {
  // Active users first
  if (isActiveUser(a) && !isActiveUser(b)) return -1;
  if (!isActiveUser(a) && isActiveUser(b)) return 1;
  
  // Then by followers
  return compareByFollowers(a, b);
}

/**
 * Filter active users
 */
export function filterActiveUsers(users: FarcasterUser[]): FarcasterUser[] {
  return users.filter(isActiveUser);
}

/**
 * Filter verified users
 */
export function filterVerifiedUsers(users: FarcasterUser[]): FarcasterUser[] {
  return users.filter(hasVerifications);
}

/**
 * Find user by FID in array
 */
export function findUserByFID(users: FarcasterUser[], fid: FID): FarcasterUser | undefined {
  return users.find(user => user.fid === fid);
}

/**
 * Find user by username in array
 */
export function findUserByUsername(users: FarcasterUser[], username: string): FarcasterUser | undefined {
  const cleanUsername = parseUsername(username).toLowerCase();
  return users.find(user => 
    user.username?.toLowerCase() === cleanUsername
  );
}

/**
 * Check if two users are the same
 */
export function isSameUser(user1: FarcasterUser, user2: FarcasterUser): boolean {
  return user1.fid === user2.fid;
}

/**
 * Get user summary for logging
 */
export function getUserSummary(user: FarcasterUser): string {
  return `${getUserDisplayName(user)} (FID: ${user.fid})`;
}

/**
 * Validate FID list
 */
export function validateFIDs(fids: unknown[]): ValidationResult {
  if (!Array.isArray(fids) || fids.length === 0) {
    return { valid: false, error: 'FIDs must be a non-empty array' };
  }
  
  if (fids.length > 100) {
    return { valid: false, error: 'Maximum 100 FIDs allowed per request' };
  }
  
  for (const fid of fids) {
    if (!isValidFID(fid)) {
      return { valid: false, error: `Invalid FID: ${fid}` };
    }
  }
  
  return { valid: true };
}

/**
 * Validate username list
 */
export function validateUsernames(usernames: string[]): ValidationResult {
  if (!Array.isArray(usernames) || usernames.length === 0) {
    return { valid: false, error: 'Usernames must be a non-empty array' };
  }
  
  for (const username of usernames) {
    if (!isValidUsername(username)) {
      return { valid: false, error: `Invalid username: ${username}` };
    }
  }
  
  return { valid: true };
}

/**
 * Extract FIDs from user array
 */
export function extractFIDs(users: FarcasterUser[]): FID[] {
  return users.map(user => user.fid);
}

/**
 * Deduplicate users by FID
 */
export function deduplicateUsers(users: FarcasterUser[]): FarcasterUser[] {
  const seen = new Set<FID>();
  return users.filter(user => {
    if (seen.has(user.fid)) return false;
    seen.add(user.fid);
    return true;
  });
}

/**
 * Group users by verification status
 */
export function groupUsersByVerification(users: FarcasterUser[]): {
  verified: FarcasterUser[];
  unverified: FarcasterUser[];
} {
  return {
    verified: users.filter(hasVerifications),
    unverified: users.filter(user => !hasVerifications(user)),
  };
}

/**
 * Get top users by followers
 */
export function getTopUsers(users: FarcasterUser[], count: number = 10): FarcasterUser[] {
  return [...users].sort(compareByFollowers).slice(0, count);
}

/**
 * Search users by query
 */
export function searchUsers(users: FarcasterUser[], query: string): FarcasterUser[] {
  const lowerQuery = query.toLowerCase();
  
  return users.filter(user => {
    const username = (user.username || '').toLowerCase();
    const displayName = (user.displayName || '').toLowerCase();
    const bio = getUserBio(user).toLowerCase();
    
    return (
      username.includes(lowerQuery) ||
      displayName.includes(lowerQuery) ||
      bio.includes(lowerQuery)
    );
  });
}

/**
 * Build user profile URL
 */
export function buildProfileURL(user: FarcasterUser): string {
  if (user.username) {
    return `https://warpcast.com/${user.username}`;
  }
  return `https://warpcast.com/~/profiles/${user.fid}`;
}

/**
 * Serialize user for storage
 */
export function serializeUser(user: FarcasterUser): string {
  return JSON.stringify({
    fid: user.fid,
    username: user.username,
    displayName: user.displayName,
  });
}

/**
 * Deserialize user from storage
 */
export function deserializeUser(serialized: string): Partial<FarcasterUser> | null {
  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

