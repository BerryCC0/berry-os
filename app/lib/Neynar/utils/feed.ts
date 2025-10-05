/**
 * Neynar SDK - Feed Utilities
 * 
 * Pure business logic for handling Farcaster feeds.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/feed
 */

import type {
  FeedType,
  FeedOptions,
  Cast,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a feed type
 * 
 * @param type - Feed type to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidFeedType('following') // true
 * isValidFeedType('invalid') // false
 * ```
 */
export function isValidFeedType(type: string): type is FeedType {
  const validTypes: FeedType[] = [
    'following',
    'filter',
    'channel',
  ];
  return validTypes.includes(type as FeedType);
}

/**
 * Validates feed options
 * 
 * @param options - Feed options to validate
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * validateFeedOptions({ feedType: 'following', fid: 3621 })
 * ```
 */
export function validateFeedOptions(options: FeedOptions): {
  valid: boolean;
  error?: string;
} {
  if (!options.feedType || !isValidFeedType(options.feedType)) {
    return { valid: false, error: 'Invalid feed type' };
  }

  if (options.feedType === 'following' && !options.fid) {
    return { valid: false, error: 'FID required for following feed' };
  }

  if (options.feedType === 'channel' && !options.channelId) {
    return { valid: false, error: 'Channel ID required for channel feed' };
  }

  if (options.limit && (options.limit < 1 || options.limit > 100)) {
    return { valid: false, error: 'Limit must be between 1 and 100' };
  }

  return { valid: true };
}

// ============================================================================
// Feed Type Utilities
// ============================================================================

/**
 * Gets feed type label
 * 
 * @param type - Feed type
 * @returns Display label
 * 
 * @example
 * ```typescript
 * getFeedTypeLabel('following') // 'Following'
 * getFeedTypeLabel('channel') // 'Channel'
 * ```
 */
export function getFeedTypeLabel(type: FeedType): string {
  const labels: Record<FeedType, string> = {
    following: 'Following',
    filter: 'Filtered',
    channel: 'Channel',
  };
  return labels[type];
}

/**
 * Checks if feed type requires authentication
 * 
 * @param type - Feed type
 * @returns True if auth required
 * 
 * @example
 * ```typescript
 * requiresAuth('following') // true
 * requiresAuth('channel') // false
 * ```
 */
export function requiresAuth(type: FeedType): boolean {
  return type === 'following';
}

// ============================================================================
// Feed Filtering
// ============================================================================

/**
 * Filters casts by text content
 * 
 * @param casts - Casts to filter
 * @param searchTerm - Search term
 * @returns Filtered casts
 * 
 * @example
 * ```typescript
 * const results = filterByContent(casts, 'nouns')
 * ```
 */
export function filterByContent(casts: Cast[], searchTerm: string): Cast[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return casts;
  
  return casts.filter(cast => 
    cast.text.toLowerCase().includes(term)
  );
}

/**
 * Filters casts by author FID
 * 
 * @param casts - Casts to filter
 * @param fid - Author FID
 * @returns Filtered casts
 * 
 * @example
 * ```typescript
 * const userCasts = filterByAuthorFid(casts, 3621)
 * ```
 */
export function filterByAuthorFid(casts: Cast[], fid: number): Cast[] {
  return casts.filter(cast => cast.author.fid === fid);
}

/**
 * Filters casts with minimum reactions
 * 
 * @param casts - Casts to filter
 * @param minReactions - Minimum reaction count
 * @returns Filtered casts
 * 
 * @example
 * ```typescript
 * const popular = filterByMinReactions(casts, 10)
 * ```
 */
export function filterByMinReactions(casts: Cast[], minReactions: number): Cast[] {
  return casts.filter(cast => {
    const likes = cast.reactions?.likes || 0;
    const recasts = cast.reactions?.recasts || 0;
    return (likes + recasts) >= minReactions;
  });
}

/**
 * Filters casts with embeds
 * 
 * @param casts - Casts to filter
 * @returns Casts with embeds
 * 
 * @example
 * ```typescript
 * const withMedia = filterWithEmbeds(casts)
 * ```
 */
export function filterWithEmbeds(casts: Cast[]): Cast[] {
  return casts.filter(cast => 
    cast.embeds && cast.embeds.length > 0
  );
}

/**
 * Filters casts without embeds (text only)
 * 
 * @param casts - Casts to filter
 * @returns Text-only casts
 * 
 * @example
 * ```typescript
 * const textOnly = filterTextOnly(casts)
 * ```
 */
export function filterTextOnly(casts: Cast[]): Cast[] {
  return casts.filter(cast => 
    !cast.embeds || cast.embeds.length === 0
  );
}

/**
 * Filters casts by time range
 * 
 * @param casts - Casts to filter
 * @param startTime - Start timestamp (ms)
 * @param endTime - End timestamp (ms)
 * @returns Filtered casts
 * 
 * @example
 * ```typescript
 * const recent = filterByTimeRange(
 *   casts,
 *   Date.now() - 86400000, // 24h ago
 *   Date.now()
 * )
 * ```
 */
export function filterByTimeRange(
  casts: Cast[],
  startTime: number,
  endTime: number
): Cast[] {
  return casts.filter(cast => {
    const timestamp = new Date(cast.timestamp).getTime();
    return timestamp >= startTime && timestamp <= endTime;
  });
}

// ============================================================================
// Feed Sorting
// ============================================================================

/**
 * Sorts feed by recency (newest first)
 * 
 * @param casts - Casts to sort
 * @returns Sorted casts
 * 
 * @example
 * ```typescript
 * const sorted = sortByRecent(casts)
 * ```
 */
export function sortByRecent(casts: Cast[]): Cast[] {
  return [...casts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Sorts feed by engagement (most engaged first)
 * 
 * @param casts - Casts to sort
 * @returns Sorted casts
 * 
 * @example
 * ```typescript
 * const sorted = sortByEngagement(casts)
 * ```
 */
export function sortByEngagement(casts: Cast[]): Cast[] {
  return [...casts].sort((a, b) => {
    const engagementA = (a.reactions?.likes || 0) + (a.reactions?.recasts || 0) * 2;
    const engagementB = (b.reactions?.likes || 0) + (b.reactions?.recasts || 0) * 2;
    return engagementB - engagementA;
  });
}

/**
 * Sorts feed by trending score (engagement + recency)
 * 
 * @param casts - Casts to sort
 * @returns Sorted casts
 * 
 * @example
 * ```typescript
 * const sorted = sortByTrending(casts)
 * ```
 */
export function sortByTrending(casts: Cast[]): Cast[] {
  const now = Date.now();
  
  return [...casts].sort((a, b) => {
    const scoreA = calculateTrendingScore(a, now);
    const scoreB = calculateTrendingScore(b, now);
    return scoreB - scoreA;
  });
}

/**
 * Calculates trending score for a cast
 * 
 * @param cast - Cast to score
 * @param currentTime - Current timestamp (ms)
 * @returns Trending score
 * 
 * @example
 * ```typescript
 * const score = calculateTrendingScore(cast, Date.now())
 * ```
 */
export function calculateTrendingScore(cast: Cast, currentTime: number): number {
  const likes = cast.reactions?.likes || 0;
  const recasts = cast.reactions?.recasts || 0;
  const replies = cast.reactions?.replies || 0;
  
  // Engagement score (weighted)
  const engagement = likes + (recasts * 2) + (replies * 1.5);
  
  // Time decay (hours since posted)
  const timestamp = new Date(cast.timestamp).getTime();
  const hoursOld = (currentTime - timestamp) / (1000 * 60 * 60);
  const timeFactor = Math.pow(hoursOld + 2, -1.5); // Decay curve
  
  return engagement * timeFactor;
}

// ============================================================================
// Feed Pagination
// ============================================================================

/**
 * Paginates feed results
 * 
 * @param casts - All casts
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated casts
 * 
 * @example
 * ```typescript
 * const page1 = paginateFeed(casts, 1, 25)
 * const page2 = paginateFeed(casts, 2, 25)
 * ```
 */
export function paginateFeed(
  casts: Cast[],
  page: number,
  pageSize: number
): Cast[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return casts.slice(startIndex, endIndex);
}

/**
 * Gets total page count
 * 
 * @param totalItems - Total number of items
 * @param pageSize - Items per page
 * @returns Number of pages
 * 
 * @example
 * ```typescript
 * const pages = getTotalPages(100, 25) // 4
 * ```
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Checks if there are more pages
 * 
 * @param currentPage - Current page number
 * @param totalItems - Total number of items
 * @param pageSize - Items per page
 * @returns True if more pages exist
 * 
 * @example
 * ```typescript
 * hasMorePages(1, 100, 25) // true
 * hasMorePages(4, 100, 25) // false
 * ```
 */
export function hasMorePages(
  currentPage: number,
  totalItems: number,
  pageSize: number
): boolean {
  return currentPage < getTotalPages(totalItems, pageSize);
}

// ============================================================================
// Feed Merging
// ============================================================================

/**
 * Merges multiple feeds (deduplicates by hash)
 * 
 * @param feeds - Array of cast arrays to merge
 * @returns Merged and deduplicated casts
 * 
 * @example
 * ```typescript
 * const merged = mergeFeeds([feed1, feed2, feed3])
 * ```
 */
export function mergeFeeds(feeds: Cast[][]): Cast[] {
  const allCasts = feeds.flat();
  const seen = new Set<string>();
  
  return allCasts.filter(cast => {
    if (seen.has(cast.hash)) {
      return false;
    }
    seen.add(cast.hash);
    return true;
  });
}

/**
 * Interleaves multiple feeds (alternates between sources)
 * 
 * @param feeds - Array of cast arrays to interleave
 * @returns Interleaved casts
 * 
 * @example
 * ```typescript
 * const interleaved = interleaveFeeds([feed1, feed2])
 * // [feed1[0], feed2[0], feed1[1], feed2[1], ...]
 * ```
 */
export function interleaveFeeds(feeds: Cast[][]): Cast[] {
  const result: Cast[] = [];
  const maxLength = Math.max(...feeds.map(f => f.length));
  
  for (let i = 0; i < maxLength; i++) {
    feeds.forEach(feed => {
      if (i < feed.length) {
        result.push(feed[i]);
      }
    });
  }
  
  return result;
}

// ============================================================================
// Feed Statistics
// ============================================================================

/**
 * Gets feed statistics
 * 
 * @param casts - Feed casts
 * @returns Statistics object
 * 
 * @example
 * ```typescript
 * const stats = getFeedStats(casts)
 * // {
 * //   totalCasts: 100,
 * //   totalLikes: 500,
 * //   totalRecasts: 200,
 * //   uniqueAuthors: 50,
 * //   avgEngagement: 7.0
 * // }
 * ```
 */
export function getFeedStats(casts: Cast[]): {
  totalCasts: number;
  totalLikes: number;
  totalRecasts: number;
  totalReplies: number;
  uniqueAuthors: number;
  avgEngagement: number;
} {
  const uniqueAuthors = new Set(casts.map(c => c.author.fid));
  
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;
  
  casts.forEach(cast => {
    totalLikes += cast.reactions?.likes || 0;
    totalRecasts += cast.reactions?.recasts || 0;
    totalReplies += cast.reactions?.replies || 0;
  });
  
  const totalEngagement = totalLikes + totalRecasts + totalReplies;
  const avgEngagement = casts.length > 0 ? totalEngagement / casts.length : 0;
  
  return {
    totalCasts: casts.length,
    totalLikes,
    totalRecasts,
    totalReplies,
    uniqueAuthors: uniqueAuthors.size,
    avgEngagement: Math.round(avgEngagement * 10) / 10,
  };
}

/**
 * Gets most active authors in feed
 * 
 * @param casts - Feed casts
 * @param limit - Number of authors to return
 * @returns Array of FIDs sorted by cast count
 * 
 * @example
 * ```typescript
 * const topAuthors = getMostActiveAuthors(casts, 10)
 * // [3621, 1234, 5678, ...]
 * ```
 */
export function getMostActiveAuthors(casts: Cast[], limit: number = 10): number[] {
  const counts = new Map<number, number>();
  
  casts.forEach(cast => {
    const fid = cast.author.fid;
    counts.set(fid, (counts.get(fid) || 0) + 1);
  });
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([fid]) => fid);
}

// ============================================================================
// Feed Formatting
// ============================================================================

/**
 * Gets feed summary text
 * 
 * @param casts - Feed casts
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getFeedSummary(casts)
 * // '100 casts from 50 authors'
 * ```
 */
export function getFeedSummary(casts: Cast[]): string {
  const stats = getFeedStats(casts);
  return `${stats.totalCasts} ${stats.totalCasts === 1 ? 'cast' : 'casts'} from ${stats.uniqueAuthors} ${stats.uniqueAuthors === 1 ? 'author' : 'authors'}`;
}

