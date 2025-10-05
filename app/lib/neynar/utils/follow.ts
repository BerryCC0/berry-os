/**
 * Neynar SDK - Follow Utilities
 * 
 * Pure business logic for handling Farcaster follow relationships.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/follow
 */

import type {
  FarcasterUser,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates follow operation options
 * 
 * @param options - Follow options to validate
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * validateFollowOptions({
 *   signerUuid: 'abc-123',
 *   targetFids: [3621, 1234]
 * })
 * ```
 */
export function validateFollowOptions(options: {
  signerUuid: string;
  targetFids: number[];
}): { valid: boolean; error?: string } {
  if (!options.signerUuid || options.signerUuid.trim() === '') {
    return { valid: false, error: 'Signer UUID is required' };
  }

  if (!Array.isArray(options.targetFids) || options.targetFids.length === 0) {
    return { valid: false, error: 'At least one target FID is required' };
  }

  if (options.targetFids.some(fid => !Number.isInteger(fid) || fid <= 0)) {
    return { valid: false, error: 'All target FIDs must be positive integers' };
  }

  if (options.targetFids.length > 100) {
    return { valid: false, error: 'Maximum 100 target FIDs allowed' };
  }

  return { valid: true };
}

/**
 * Validates unfollow operation options
 * 
 * @param options - Unfollow options to validate
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * validateUnfollowOptions({
 *   signerUuid: 'abc-123',
 *   targetFids: [3621]
 * })
 * ```
 */
export function validateUnfollowOptions(options: {
  signerUuid: string;
  targetFids: number[];
}): { valid: boolean; error?: string } {
  return validateFollowOptions(options); // Same validation rules
}

// ============================================================================
// Follow Status Checks
// ============================================================================

/**
 * Checks if user is following target
 * 
 * @param followers - Array of follower FIDs
 * @param targetFid - Target user FID
 * @returns True if following
 * 
 * @example
 * ```typescript
 * isFollowing([3621, 1234, 5678], 3621) // true
 * ```
 */
export function isFollowing(followers: number[], targetFid: number): boolean {
  return followers.includes(targetFid);
}

/**
 * Checks if user is followed by target
 * 
 * @param following - Array of following FIDs
 * @param targetFid - Target user FID
 * @returns True if followed by
 * 
 * @example
 * ```typescript
 * isFollowedBy([3621, 1234, 5678], 3621) // true
 * ```
 */
export function isFollowedBy(following: number[], targetFid: number): boolean {
  return following.includes(targetFid);
}

/**
 * Checks if two users follow each other (mutual)
 * 
 * @param userFollowing - User's following list
 * @param userFollowers - User's follower list
 * @param targetFid - Target user FID
 * @returns True if mutual follow
 * 
 * @example
 * ```typescript
 * isMutualFollow(following, followers, 3621) // true
 * ```
 */
export function isMutualFollow(
  userFollowing: number[],
  userFollowers: number[],
  targetFid: number
): boolean {
  return isFollowing(userFollowing, targetFid) && isFollowedBy(userFollowers, targetFid);
}

// ============================================================================
// Follow List Operations
// ============================================================================

/**
 * Gets common followers between two users
 * 
 * @param user1Followers - First user's followers
 * @param user2Followers - Second user's followers
 * @returns Array of common follower FIDs
 * 
 * @example
 * ```typescript
 * const common = getCommonFollowers(
 *   [3621, 1234, 5678],
 *   [1234, 5678, 9012]
 * )
 * // [1234, 5678]
 * ```
 */
export function getCommonFollowers(
  user1Followers: number[],
  user2Followers: number[]
): number[] {
  const set2 = new Set(user2Followers);
  return user1Followers.filter(fid => set2.has(fid));
}

/**
 * Gets common following between two users
 * 
 * @param user1Following - First user's following list
 * @param user2Following - Second user's following list
 * @returns Array of common following FIDs
 * 
 * @example
 * ```typescript
 * const common = getCommonFollowing(
 *   [3621, 1234, 5678],
 *   [1234, 5678, 9012]
 * )
 * // [1234, 5678]
 * ```
 */
export function getCommonFollowing(
  user1Following: number[],
  user2Following: number[]
): number[] {
  const set2 = new Set(user2Following);
  return user1Following.filter(fid => set2.has(fid));
}

/**
 * Gets users who user follows but don't follow back
 * 
 * @param following - User's following list
 * @param followers - User's follower list
 * @returns Array of non-reciprocal FIDs
 * 
 * @example
 * ```typescript
 * const nonReciprocal = getNonReciprocalFollows(
 *   [3621, 1234, 5678],
 *   [1234, 9012]
 * )
 * // [3621, 5678]
 * ```
 */
export function getNonReciprocalFollows(
  following: number[],
  followers: number[]
): number[] {
  const followerSet = new Set(followers);
  return following.filter(fid => !followerSet.has(fid));
}

/**
 * Gets users who follow user but user doesn't follow back
 * 
 * @param followers - User's follower list
 * @param following - User's following list
 * @returns Array of non-reciprocal follower FIDs
 * 
 * @example
 * ```typescript
 * const nonReciprocal = getNonReciprocalFollowers(
 *   [3621, 1234, 5678],
 *   [1234, 9012]
 * )
 * // [3621, 5678]
 * ```
 */
export function getNonReciprocalFollowers(
  followers: number[],
  following: number[]
): number[] {
  const followingSet = new Set(following);
  return followers.filter(fid => !followingSet.has(fid));
}

/**
 * Gets mutual follows (both follow each other)
 * 
 * @param following - User's following list
 * @param followers - User's follower list
 * @returns Array of mutual follow FIDs
 * 
 * @example
 * ```typescript
 * const mutual = getMutualFollows(
 *   [3621, 1234, 5678],
 *   [1234, 5678, 9012]
 * )
 * // [1234, 5678]
 * ```
 */
export function getMutualFollows(
  following: number[],
  followers: number[]
): number[] {
  const followerSet = new Set(followers);
  return following.filter(fid => followerSet.has(fid));
}

// ============================================================================
// Follow Statistics
// ============================================================================

/**
 * Calculates follower/following ratio
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @returns Ratio (followers/following)
 * 
 * @example
 * ```typescript
 * getFollowRatio(1000, 100) // 10.0
 * getFollowRatio(100, 1000) // 0.1
 * ```
 */
export function getFollowRatio(
  followerCount: number,
  followingCount: number
): number {
  if (followingCount === 0) return followerCount > 0 ? Infinity : 0;
  return followerCount / followingCount;
}

/**
 * Calculates mutual follow percentage
 * 
 * @param following - User's following list
 * @param followers - User's follower list
 * @returns Percentage (0-100)
 * 
 * @example
 * ```typescript
 * getMutualFollowPercentage([1, 2, 3, 4], [2, 3]) // 50
 * ```
 */
export function getMutualFollowPercentage(
  following: number[],
  followers: number[]
): number {
  if (following.length === 0) return 0;
  const mutualCount = getMutualFollows(following, followers).length;
  return (mutualCount / following.length) * 100;
}

/**
 * Gets follow engagement score (0-100)
 * 
 * Based on follower count, ratio, and mutual follows.
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @param mutualCount - Number of mutual follows
 * @returns Engagement score (0-100)
 * 
 * @example
 * ```typescript
 * getFollowEngagementScore(1000, 500, 400) // 85
 * ```
 */
export function getFollowEngagementScore(
  followerCount: number,
  followingCount: number,
  mutualCount: number
): number {
  // Normalize follower count (logarithmic scale)
  const followerScore = Math.min(Math.log10(followerCount + 1) * 20, 40);
  
  // Ratio score (balanced is better)
  const ratio = getFollowRatio(followerCount, followingCount);
  const ratioScore = ratio >= 0.5 && ratio <= 2 ? 30 : 15;
  
  // Mutual follow score
  const mutualPercentage = followingCount > 0 ? (mutualCount / followingCount) * 100 : 0;
  const mutualScore = Math.min(mutualPercentage * 0.3, 30);
  
  return Math.round(followerScore + ratioScore + mutualScore);
}

// ============================================================================
// User Type Classification
// ============================================================================

/**
 * Checks if user is a potential influencer
 * 
 * High follower count, moderate following, good ratio.
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @returns True if potential influencer
 * 
 * @example
 * ```typescript
 * isInfluencer(10000, 500) // true
 * isInfluencer(100, 5000) // false
 * ```
 */
export function isInfluencer(
  followerCount: number,
  followingCount: number
): boolean {
  const ratio = getFollowRatio(followerCount, followingCount);
  return followerCount >= 1000 && ratio >= 2;
}

/**
 * Checks if user follows many but has few followers
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @returns True if potential spam/bot pattern
 * 
 * @example
 * ```typescript
 * isHighFollowLowFollower(50, 5000) // true
 * ```
 */
export function isHighFollowLowFollower(
  followerCount: number,
  followingCount: number
): boolean {
  const ratio = getFollowRatio(followerCount, followingCount);
  return followingCount > 1000 && ratio < 0.1;
}

/**
 * Checks if user has balanced follower/following
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @returns True if balanced (0.5 <= ratio <= 2)
 * 
 * @example
 * ```typescript
 * hasBalancedFollows(800, 1000) // true
 * hasBalancedFollows(100, 5000) // false
 * ```
 */
export function hasBalancedFollows(
  followerCount: number,
  followingCount: number
): boolean {
  const ratio = getFollowRatio(followerCount, followingCount);
  return ratio >= 0.5 && ratio <= 2;
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters users by minimum follower count
 * 
 * @param users - Users to filter
 * @param minFollowers - Minimum follower count
 * @returns Filtered users
 * 
 * @example
 * ```typescript
 * const popular = filterByMinFollowers(users, 1000)
 * ```
 */
export function filterByMinFollowers(
  users: FarcasterUser[],
  minFollowers: number
): FarcasterUser[] {
  return users.filter(u => (u.followerCount || 0) >= minFollowers);
}

/**
 * Filters users by maximum following count
 * 
 * @param users - Users to filter
 * @param maxFollowing - Maximum following count
 * @returns Filtered users
 * 
 * @example
 * ```typescript
 * const selective = filterByMaxFollowing(users, 500)
 * ```
 */
export function filterByMaxFollowing(
  users: FarcasterUser[],
  maxFollowing: number
): FarcasterUser[] {
  return users.filter(u => (u.followingCount || 0) <= maxFollowing);
}

/**
 * Filters users by follow ratio range
 * 
 * @param users - Users to filter
 * @param minRatio - Minimum ratio
 * @param maxRatio - Maximum ratio
 * @returns Filtered users
 * 
 * @example
 * ```typescript
 * const balanced = filterByFollowRatio(users, 0.5, 2)
 * ```
 */
export function filterByFollowRatio(
  users: FarcasterUser[],
  minRatio: number,
  maxRatio: number
): FarcasterUser[] {
  return users.filter(u => {
    const ratio = getFollowRatio(u.followerCount || 0, u.followingCount || 0);
    return ratio >= minRatio && ratio <= maxRatio;
  });
}

/**
 * Filters for influencers
 * 
 * @param users - Users to filter
 * @returns Influencer users
 * 
 * @example
 * ```typescript
 * const influencers = filterInfluencers(users)
 * ```
 */
export function filterInfluencers(users: FarcasterUser[]): FarcasterUser[] {
  return users.filter(u => 
    isInfluencer(u.followerCount || 0, u.followingCount || 0)
  );
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts users by follower count (descending)
 * 
 * @param users - Users to sort
 * @returns Sorted users
 * 
 * @example
 * ```typescript
 * const sorted = sortByFollowerCount(users)
 * ```
 */
export function sortByFollowerCount(users: FarcasterUser[]): FarcasterUser[] {
  return [...users].sort((a, b) => 
    (b.followerCount || 0) - (a.followerCount || 0)
  );
}

/**
 * Sorts users by following count (descending)
 * 
 * @param users - Users to sort
 * @returns Sorted users
 * 
 * @example
 * ```typescript
 * const sorted = sortByFollowingCount(users)
 * ```
 */
export function sortByFollowingCount(users: FarcasterUser[]): FarcasterUser[] {
  return [...users].sort((a, b) => 
    (b.followingCount || 0) - (a.followingCount || 0)
  );
}

/**
 * Sorts users by follow ratio (descending)
 * 
 * @param users - Users to sort
 * @returns Sorted users
 * 
 * @example
 * ```typescript
 * const sorted = sortByFollowRatio(users)
 * ```
 */
export function sortByFollowRatio(users: FarcasterUser[]): FarcasterUser[] {
  return [...users].sort((a, b) => {
    const ratioA = getFollowRatio(a.followerCount || 0, a.followingCount || 0);
    const ratioB = getFollowRatio(b.followerCount || 0, b.followingCount || 0);
    return ratioB - ratioA;
  });
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats follow count for display
 * 
 * @param count - Follow count
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatFollowCount(1234567) // '1.2M'
 * formatFollowCount(42) // '42'
 * ```
 */
export function formatFollowCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Gets follow status label
 * 
 * @param isFollowing - User is following target
 * @param isFollowedBy - User is followed by target
 * @returns Status label
 * 
 * @example
 * ```typescript
 * getFollowStatusLabel(true, true) // 'Mutual'
 * getFollowStatusLabel(true, false) // 'Following'
 * getFollowStatusLabel(false, true) // 'Follows You'
 * getFollowStatusLabel(false, false) // 'Not Following'
 * ```
 */
export function getFollowStatusLabel(
  isFollowing: boolean,
  isFollowedBy: boolean
): string {
  if (isFollowing && isFollowedBy) return 'Mutual';
  if (isFollowing) return 'Following';
  if (isFollowedBy) return 'Follows You';
  return 'Not Following';
}

/**
 * Gets follow stats summary
 * 
 * @param followerCount - Number of followers
 * @param followingCount - Number of following
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getFollowSummary(1234, 567)
 * // '1.2K followers • 567 following'
 * ```
 */
export function getFollowSummary(
  followerCount: number,
  followingCount: number
): string {
  const formattedFollowers = formatFollowCount(followerCount);
  const formattedFollowing = formatFollowCount(followingCount);
  
  return `${formattedFollowers} ${followerCount === 1 ? 'follower' : 'followers'} • ${formattedFollowing} following`;
}

// ============================================================================
// Follow Suggestions
// ============================================================================

/**
 * Suggests users to follow based on mutual connections
 * 
 * @param userFollowing - User's current following list
 * @param friendsFollowing - List of FIDs that friends follow
 * @param limit - Number of suggestions
 * @returns Array of suggested FIDs
 * 
 * @example
 * ```typescript
 * const suggestions = getSuggestedFollows(
 *   [1, 2, 3],
 *   [2, 3, 4, 5, 4, 5],
 *   3
 * )
 * // [4, 5] - most common among friends, not already following
 * ```
 */
export function getSuggestedFollows(
  userFollowing: number[],
  friendsFollowing: number[],
  limit: number = 10
): number[] {
  const userFollowingSet = new Set(userFollowing);
  const counts = new Map<number, number>();
  
  // Count how many friends follow each user
  friendsFollowing.forEach(fid => {
    if (!userFollowingSet.has(fid)) {
      counts.set(fid, (counts.get(fid) || 0) + 1);
    }
  });
  
  // Sort by count and return top suggestions
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fid]) => fid);
}

