/**
 * Neynar SDK - Reaction Utilities
 * 
 * Pure business logic for handling Farcaster reactions (likes, recasts).
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/reaction
 */

import type {
  Reaction,
  ReactionType,
  Cast,
  FarcasterUser,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a reaction type
 * 
 * @param type - Reaction type to validate
 * @returns True if valid reaction type
 * 
 * @example
 * ```typescript
 * isValidReactionType('like') // true
 * isValidReactionType('invalid') // false
 * ```
 */
export function isValidReactionType(type: string): type is ReactionType {
  return ['like', 'recast'].includes(type);
}

/**
 * Validates reaction create options
 * 
 * @param options - Reaction options to validate
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * validateReactionOptions({
 *   signerUuid: 'abc-123',
 *   reactionType: 'like',
 *   target: 'cast-hash'
 * })
 * ```
 */
export function validateReactionOptions(options: {
  signerUuid: string;
  reactionType: ReactionType;
  target: string;
  targetAuthorFid?: number;
}): { valid: boolean; error?: string } {
  if (!options.signerUuid || options.signerUuid.trim() === '') {
    return { valid: false, error: 'Signer UUID is required' };
  }

  if (!isValidReactionType(options.reactionType)) {
    return { valid: false, error: 'Invalid reaction type' };
  }

  if (!options.target || options.target.trim() === '') {
    return { valid: false, error: 'Target is required' };
  }

  return { valid: true };
}

// ============================================================================
// Reaction Type Utilities
// ============================================================================

/**
 * Checks if reaction is a like
 * 
 * @param reaction - Reaction to check
 * @returns True if like
 * 
 * @example
 * ```typescript
 * isLike(reaction) // true/false
 * ```
 */
export function isLike(reaction: Reaction): boolean {
  return reaction.reactionType === 'like';
}

/**
 * Checks if reaction is a recast
 * 
 * @param reaction - Reaction to check
 * @returns True if recast
 * 
 * @example
 * ```typescript
 * isRecast(reaction) // true/false
 * ```
 */
export function isRecast(reaction: Reaction): boolean {
  return reaction.reactionType === 'recast';
}

/**
 * Gets display label for reaction type
 * 
 * @param type - Reaction type
 * @returns Display label
 * 
 * @example
 * ```typescript
 * getReactionLabel('like') // 'Like'
 * getReactionLabel('recast') // 'Recast'
 * ```
 */
export function getReactionLabel(type: ReactionType): string {
  const labels: Record<ReactionType, string> = {
    like: 'Like',
    recast: 'Recast',
  };
  return labels[type];
}

/**
 * Gets emoji for reaction type
 * 
 * @param type - Reaction type
 * @returns Emoji string
 * 
 * @example
 * ```typescript
 * getReactionEmoji('like') // '❤️'
 * getReactionEmoji('recast') // '🔁'
 * ```
 */
export function getReactionEmoji(type: ReactionType): string {
  const emojis: Record<ReactionType, string> = {
    like: '❤️',
    recast: '🔁',
  };
  return emojis[type];
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters reactions by type
 * 
 * @param reactions - Reactions to filter
 * @param type - Reaction type to filter by
 * @returns Filtered reactions
 * 
 * @example
 * ```typescript
 * const likes = filterReactionsByType(reactions, 'like')
 * const recasts = filterReactionsByType(reactions, 'recast')
 * ```
 */
export function filterReactionsByType(
  reactions: Reaction[],
  type: ReactionType
): Reaction[] {
  return reactions.filter(r => r.reactionType === type);
}

/**
 * Filters reactions by user
 * 
 * @param reactions - Reactions to filter
 * @param fid - User FID to filter by
 * @returns Filtered reactions
 * 
 * @example
 * ```typescript
 * const userReactions = filterReactionsByUser(reactions, 3621)
 * ```
 */
export function filterReactionsByUser(
  reactions: Reaction[],
  fid: number
): Reaction[] {
  return reactions.filter(r => r.user.fid === fid);
}

/**
 * Filters reactions by cast
 * 
 * @param reactions - Reactions to filter
 * @param castHash - Cast hash to filter by
 * @returns Filtered reactions
 * 
 * @example
 * ```typescript
 * const castReactions = filterReactionsByCast(reactions, '0xabc...')
 * ```
 */
export function filterReactionsByCast(
  reactions: Reaction[],
  castHash: string
): Reaction[] {
  return reactions.filter(r => r.cast.hash === castHash);
}

/**
 * Filters reactions by time range
 * 
 * @param reactions - Reactions to filter
 * @param startTime - Start timestamp
 * @param endTime - End timestamp
 * @returns Filtered reactions
 * 
 * @example
 * ```typescript
 * const recent = filterReactionsByTimeRange(
 *   reactions,
 *   Date.now() - 86400000, // 24h ago
 *   Date.now()
 * )
 * ```
 */
export function filterReactionsByTimeRange(
  reactions: Reaction[],
  startTime: number,
  endTime: number
): Reaction[] {
  return reactions.filter(r => {
    const timestamp = new Date(r.reactionTimestamp).getTime();
    return timestamp >= startTime && timestamp <= endTime;
  });
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts reactions by timestamp (newest first)
 * 
 * @param reactions - Reactions to sort
 * @returns Sorted reactions
 * 
 * @example
 * ```typescript
 * const sorted = sortReactionsByRecent(reactions)
 * ```
 */
export function sortReactionsByRecent(reactions: Reaction[]): Reaction[] {
  return [...reactions].sort((a, b) => 
    new Date(b.reactionTimestamp).getTime() - new Date(a.reactionTimestamp).getTime()
  );
}

/**
 * Sorts reactions by timestamp (oldest first)
 * 
 * @param reactions - Reactions to sort
 * @returns Sorted reactions
 * 
 * @example
 * ```typescript
 * const sorted = sortReactionsByOldest(reactions)
 * ```
 */
export function sortReactionsByOldest(reactions: Reaction[]): Reaction[] {
  return [...reactions].sort((a, b) => 
    new Date(a.reactionTimestamp).getTime() - new Date(b.reactionTimestamp).getTime()
  );
}

// ============================================================================
// Aggregation & Statistics
// ============================================================================

/**
 * Gets total reaction count
 * 
 * @param reactions - Reactions to count
 * @returns Total count
 * 
 * @example
 * ```typescript
 * getTotalReactionCount(reactions) // 42
 * ```
 */
export function getTotalReactionCount(reactions: Reaction[]): number {
  return reactions.length;
}

/**
 * Gets like count
 * 
 * @param reactions - Reactions to count
 * @returns Like count
 * 
 * @example
 * ```typescript
 * getLikeCount(reactions) // 25
 * ```
 */
export function getLikeCount(reactions: Reaction[]): number {
  return filterReactionsByType(reactions, 'like').length;
}

/**
 * Gets recast count
 * 
 * @param reactions - Reactions to count
 * @returns Recast count
 * 
 * @example
 * ```typescript
 * getRecastCount(reactions) // 17
 * ```
 */
export function getRecastCount(reactions: Reaction[]): number {
  return filterReactionsByType(reactions, 'recast').length;
}

/**
 * Gets reaction counts by type
 * 
 * @param reactions - Reactions to count
 * @returns Object with counts by type
 * 
 * @example
 * ```typescript
 * getReactionCounts(reactions)
 * // { like: 25, recast: 17, total: 42 }
 * ```
 */
export function getReactionCounts(reactions: Reaction[]): {
  like: number;
  recast: number;
  total: number;
} {
  return {
    like: getLikeCount(reactions),
    recast: getRecastCount(reactions),
    total: reactions.length,
  };
}

/**
 * Gets unique users who reacted
 * 
 * @param reactions - Reactions to analyze
 * @returns Array of unique user FIDs
 * 
 * @example
 * ```typescript
 * getUniqueReactors(reactions) // [3621, 1234, 5678]
 * ```
 */
export function getUniqueReactors(reactions: Reaction[]): number[] {
  const fids = new Set(reactions.map(r => r.user.fid));
  return Array.from(fids);
}

/**
 * Gets unique reactor count
 * 
 * @param reactions - Reactions to count
 * @returns Number of unique users
 * 
 * @example
 * ```typescript
 * getUniqueReactorCount(reactions) // 38
 * ```
 */
export function getUniqueReactorCount(reactions: Reaction[]): number {
  return getUniqueReactors(reactions).length;
}

// ============================================================================
// User Reaction Checks
// ============================================================================

/**
 * Checks if user has reacted to cast
 * 
 * @param reactions - Reactions to check
 * @param fid - User FID
 * @param castHash - Cast hash
 * @returns True if user reacted
 * 
 * @example
 * ```typescript
 * hasUserReacted(reactions, 3621, '0xabc...') // true
 * ```
 */
export function hasUserReacted(
  reactions: Reaction[],
  fid: number,
  castHash: string
): boolean {
  return reactions.some(r => r.user.fid === fid && r.cast.hash === castHash);
}

/**
 * Checks if user has liked cast
 * 
 * @param reactions - Reactions to check
 * @param fid - User FID
 * @param castHash - Cast hash
 * @returns True if user liked
 * 
 * @example
 * ```typescript
 * hasUserLiked(reactions, 3621, '0xabc...') // true
 * ```
 */
export function hasUserLiked(
  reactions: Reaction[],
  fid: number,
  castHash: string
): boolean {
  return reactions.some(
    r => r.user.fid === fid && 
         r.cast.hash === castHash && 
         r.reactionType === 'like'
  );
}

/**
 * Checks if user has recasted
 * 
 * @param reactions - Reactions to check
 * @param fid - User FID
 * @param castHash - Cast hash
 * @returns True if user recasted
 * 
 * @example
 * ```typescript
 * hasUserRecasted(reactions, 3621, '0xabc...') // true
 * ```
 */
export function hasUserRecasted(
  reactions: Reaction[],
  fid: number,
  castHash: string
): boolean {
  return reactions.some(
    r => r.user.fid === fid && 
         r.cast.hash === castHash && 
         r.reactionType === 'recast'
  );
}

/**
 * Gets user's reaction to cast
 * 
 * @param reactions - Reactions to search
 * @param fid - User FID
 * @param castHash - Cast hash
 * @returns User's reaction or null
 * 
 * @example
 * ```typescript
 * const reaction = getUserReaction(reactions, 3621, '0xabc...')
 * ```
 */
export function getUserReaction(
  reactions: Reaction[],
  fid: number,
  castHash: string
): Reaction | null {
  return reactions.find(r => r.user.fid === fid && r.cast.hash === castHash) || null;
}

// ============================================================================
// Cast Reaction Utilities
// ============================================================================

/**
 * Gets cast reaction count
 * 
 * @param cast - Cast to get reaction count for
 * @returns Total reaction count
 * 
 * @example
 * ```typescript
 * const count = getCastReactionCount(cast)
 * ```
 */
export function getCastReactionCount(cast: Cast): number {
  const likes = cast.reactions?.likes || 0;
  const recasts = cast.reactions?.recasts || 0;
  return likes + recasts;
}

/**
 * Gets cast like count
 * 
 * @param cast - Cast to count likes for
 * @returns Like count
 * 
 * @example
 * ```typescript
 * getCastLikeCount(cast) // 25
 * ```
 */
export function getCastLikeCount(cast: Cast): number {
  return cast.reactions?.likes || 0;
}

/**
 * Gets cast recast count
 * 
 * @param cast - Cast to count recasts for
 * @returns Recast count
 * 
 * @example
 * ```typescript
 * getCastRecastCount(cast) // 17
 * ```
 */
export function getCastRecastCount(cast: Cast): number {
  return cast.reactions?.recasts || 0;
}

/**
 * Checks if cast has reactions
 * 
 * @param cast - Cast to check
 * @returns True if has reactions
 * 
 * @example
 * ```typescript
 * castHasReactions(cast) // true
 * ```
 */
export function castHasReactions(cast: Cast): boolean {
  const likes = getCastLikeCount(cast);
  const recasts = getCastRecastCount(cast);
  return likes > 0 || recasts > 0;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats reaction count for display
 * 
 * @param count - Reaction count
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatReactionCount(1234) // '1.2K'
 * formatReactionCount(42) // '42'
 * ```
 */
export function formatReactionCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Gets reaction summary text
 * 
 * @param reactions - Reactions to summarize
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getReactionSummary(reactions)
 * // '25 likes • 17 recasts'
 * ```
 */
export function getReactionSummary(reactions: Reaction[]): string {
  const counts = getReactionCounts(reactions);
  const parts: string[] = [];
  
  if (counts.like > 0) {
    parts.push(`${formatReactionCount(counts.like)} ${counts.like === 1 ? 'like' : 'likes'}`);
  }
  
  if (counts.recast > 0) {
    parts.push(`${formatReactionCount(counts.recast)} ${counts.recast === 1 ? 'recast' : 'recasts'}`);
  }
  
  return parts.join(' • ') || 'No reactions';
}

// ============================================================================
// Trending & Analytics
// ============================================================================

/**
 * Calculates reaction velocity (reactions per hour)
 * 
 * @param reactions - Reactions to analyze
 * @param timeWindowHours - Time window in hours
 * @returns Reactions per hour
 * 
 * @example
 * ```typescript
 * getReactionVelocity(reactions, 24) // 10.5 reactions/hour
 * ```
 */
export function getReactionVelocity(
  reactions: Reaction[],
  timeWindowHours: number = 24
): number {
  const now = Date.now();
  const windowStart = now - (timeWindowHours * 60 * 60 * 1000);
  
  const recentReactions = filterReactionsByTimeRange(reactions, windowStart, now);
  return recentReactions.length / timeWindowHours;
}

/**
 * Gets most active reactors
 * 
 * @param reactions - Reactions to analyze
 * @param limit - Number of users to return
 * @returns Array of FIDs sorted by reaction count
 * 
 * @example
 * ```typescript
 * getMostActiveReactors(reactions, 10)
 * // [3621, 1234, 5678, ...]
 * ```
 */
export function getMostActiveReactors(
  reactions: Reaction[],
  limit: number = 10
): number[] {
  const counts = new Map<number, number>();
  
  reactions.forEach(r => {
    counts.set(r.user.fid, (counts.get(r.user.fid) || 0) + 1);
  });
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fid]) => fid);
}

/**
 * Calculates engagement ratio (reactions / followers)
 * 
 * @param reactions - Reactions to count
 * @param followerCount - Author's follower count
 * @returns Engagement ratio (0-1)
 * 
 * @example
 * ```typescript
 * getEngagementRatio(reactions, 1000) // 0.042 (4.2%)
 * ```
 */
export function getEngagementRatio(
  reactions: Reaction[],
  followerCount: number
): number {
  if (followerCount === 0) return 0;
  return reactions.length / followerCount;
}

