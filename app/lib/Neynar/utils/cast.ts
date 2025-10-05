/**
 * Neynar API - Cast Business Logic
 * Pure functions for cast operations (no React dependencies)
 */

import type {
  Cast,
  CastHash,
  FID,
  CreateCastOptions,
  ValidationResult,
} from './types';

/**
 * Maximum cast text length
 */
export const MAX_CAST_LENGTH = 320;

/**
 * Maximum embeds per cast
 */
export const MAX_EMBEDS = 2;

/**
 * Validate cast text length
 */
export function isValidCastLength(text: string): boolean {
  return text.length > 0 && text.length <= MAX_CAST_LENGTH;
}

/**
 * Validate cast hash format
 */
export function isValidCastHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(hash);
}

/**
 * Calculate cast length (accounting for URLs)
 */
export function calculateCastLength(text: string): number {
  // URLs are shortened to ~23 characters
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  
  let length = text.length;
  urls.forEach(url => {
    length -= url.length - 23; // Subtract actual length, add shortened length
  });
  
  return length;
}

/**
 * Check if cast text is too long
 */
export function isCastTooLong(text: string): boolean {
  return calculateCastLength(text) > MAX_CAST_LENGTH;
}

/**
 * Truncate cast text to max length
 */
export function truncateCastText(text: string, maxLength: number = MAX_CAST_LENGTH): string {
  if (!isCastTooLong(text)) return text;
  
  const actualLength = calculateCastLength(text);
  if (actualLength <= maxLength) return text;
  
  // Simple truncation with ellipsis
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract mentions from cast text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Extract URLs from cast text
 */
export function extractURLs(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}

/**
 * Extract hashtags from cast text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
}

/**
 * Format cast timestamp for display
 */
export function formatCastTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get cast age in milliseconds
 */
export function getCastAge(timestamp: string): number {
  return Date.now() - new Date(timestamp).getTime();
}

/**
 * Check if cast is recent (< 1 hour)
 */
export function isRecentCast(timestamp: string): boolean {
  return getCastAge(timestamp) < 3600000; // 1 hour
}

/**
 * Check if cast is a reply
 */
export function isReply(cast: Cast): boolean {
  return !!(cast.parentHash || cast.parentUrl);
}

/**
 * Check if cast is a thread root
 */
export function isThreadRoot(cast: Cast): boolean {
  return cast.hash === cast.threadHash;
}

/**
 * Get total reaction count
 */
export function getTotalReactions(cast: Cast): number {
  return (cast.reactions?.likes || 0) + (cast.reactions?.recasts || 0);
}

/**
 * Get engagement rate (reactions per hour)
 */
export function getEngagementRate(cast: Cast): number {
  const ageHours = getCastAge(cast.timestamp) / 3600000;
  if (ageHours === 0) return 0;
  
  return getTotalReactions(cast) / ageHours;
}

/**
 * Check if cast has high engagement
 */
export function hasHighEngagement(cast: Cast): boolean {
  return getEngagementRate(cast) > 10; // 10 reactions per hour
}

/**
 * Check if user liked cast
 */
export function hasUserLiked(cast: Cast): boolean {
  return cast.viewerContext?.liked || false;
}

/**
 * Check if user recasted
 */
export function hasUserRecasted(cast: Cast): boolean {
  return cast.viewerContext?.recasted || false;
}

/**
 * Format reaction count for display
 */
export function formatReactionCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Get cast preview text (first 100 chars)
 */
export function getCastPreview(cast: Cast, maxLength: number = 100): string {
  if (cast.text.length <= maxLength) return cast.text;
  return cast.text.substring(0, maxLength) + '...';
}

/**
 * Build cast URL
 */
export function buildCastURL(cast: Cast): string {
  const username = cast.author.username || cast.author.fid;
  return `https://warpcast.com/${username}/${cast.hash.substring(0, 10)}`;
}

/**
 * Build Warpcast conversation URL
 */
export function buildConversationURL(cast: Cast): string {
  return `https://warpcast.com/~/conversations/${cast.hash}`;
}

/**
 * Validate create cast options
 */
export function validateCreateCastOptions(options: CreateCastOptions): ValidationResult {
  if (!options.signerUuid || options.signerUuid.trim() === '') {
    return { valid: false, error: 'Signer UUID is required' };
  }
  
  if (!options.text || options.text.trim() === '') {
    return { valid: false, error: 'Cast text is required' };
  }
  
  if (isCastTooLong(options.text)) {
    return { 
      valid: false, 
      error: `Cast text exceeds maximum length of ${MAX_CAST_LENGTH} characters` 
    };
  }
  
  if (options.embeds && options.embeds.length > MAX_EMBEDS) {
    return { 
      valid: false, 
      error: `Maximum ${MAX_EMBEDS} embeds allowed per cast` 
    };
  }
  
  return { valid: true };
}

/**
 * Compare casts by timestamp (newest first)
 */
export function compareByTimestamp(a: Cast, b: Cast): number {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

/**
 * Compare casts by engagement
 */
export function compareByEngagement(a: Cast, b: Cast): number {
  return getTotalReactions(b) - getTotalReactions(a);
}

/**
 * Filter casts by author
 */
export function filterByAuthor(casts: Cast[], fid: FID): Cast[] {
  return casts.filter(cast => cast.author.fid === fid);
}

/**
 * Filter casts with embeds
 */
export function filterCastsWithEmbeds(casts: Cast[]): Cast[] {
  return casts.filter(cast => cast.embeds && cast.embeds.length > 0);
}

/**
 * Filter thread roots only
 */
export function filterThreadRoots(casts: Cast[]): Cast[] {
  return casts.filter(isThreadRoot);
}

/**
 * Filter replies only
 */
export function filterReplies(casts: Cast[]): Cast[] {
  return casts.filter(isReply);
}

/**
 * Group casts by thread
 */
export function groupCastsByThread(casts: Cast[]): Map<string, Cast[]> {
  const threads = new Map<string, Cast[]>();
  
  casts.forEach(cast => {
    const threadHash = cast.threadHash || cast.hash;
    if (!threads.has(threadHash)) {
      threads.set(threadHash, []);
    }
    threads.get(threadHash)!.push(cast);
  });
  
  return threads;
}

/**
 * Get thread by hash
 */
export function getThread(casts: Cast[], threadHash: string): Cast[] {
  return casts.filter(cast => cast.threadHash === threadHash);
}

/**
 * Count total replies in thread
 */
export function countThreadReplies(casts: Cast[], threadHash: string): number {
  return getThread(casts, threadHash).filter(isReply).length;
}

/**
 * Find cast by hash in array
 */
export function findCastByHash(casts: Cast[], hash: CastHash): Cast | undefined {
  return casts.find(cast => cast.hash === hash);
}

/**
 * Get cast's direct replies
 */
export function getDirectReplies(casts: Cast[], parentHash: CastHash): Cast[] {
  return casts.filter(cast => cast.parentHash === parentHash);
}

/**
 * Check if cast mentions user
 */
export function mentionsUser(cast: Cast, fid: FID): boolean {
  return cast.mentionedProfiles?.some(profile => profile.fid === fid) || false;
}

/**
 * Get all mentioned FIDs
 */
export function getMentionedFIDs(cast: Cast): FID[] {
  return cast.mentionedProfiles?.map(profile => profile.fid) || [];
}

/**
 * Extract channel from cast
 */
export function getCastChannel(cast: Cast): string | null {
  return cast.channelKey || null;
}

/**
 * Filter casts by channel
 */
export function filterByChannel(casts: Cast[], channelKey: string): Cast[] {
  return casts.filter(cast => cast.channelKey === channelKey);
}

/**
 * Get trending casts (high engagement + recent)
 */
export function getTrendingCasts(casts: Cast[], count: number = 10): Cast[] {
  return [...casts]
    .filter(cast => getCastAge(cast.timestamp) < 86400000) // Last 24 hours
    .sort((a, b) => getEngagementRate(b) - getEngagementRate(a))
    .slice(0, count);
}

/**
 * Search casts by query
 */
export function searchCasts(casts: Cast[], query: string): Cast[] {
  const lowerQuery = query.toLowerCase();
  
  return casts.filter(cast => 
    cast.text.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Deduplicate casts by hash
 */
export function deduplicateCasts(casts: Cast[]): Cast[] {
  const seen = new Set<CastHash>();
  return casts.filter(cast => {
    if (seen.has(cast.hash)) return false;
    seen.add(cast.hash);
    return true;
  });
}

/**
 * Calculate thread depth
 */
export function getThreadDepth(casts: Cast[], cast: Cast): number {
  let depth = 0;
  let current: Cast | undefined = cast;
  
  while (current?.parentHash && depth < 100) { // Max depth to prevent infinite loops
    current = findCastByHash(casts, current.parentHash);
    depth++;
  }
  
  return depth;
}

/**
 * Get cast statistics
 */
export function getCastStatistics(cast: Cast): {
  likes: number;
  recasts: number;
  replies: number;
  total: number;
  engagementRate: number;
} {
  const likes = cast.reactions?.likes || 0;
  const recasts = cast.reactions?.recasts || 0;
  const replies = cast.replies?.count || 0;
  
  return {
    likes,
    recasts,
    replies,
    total: likes + recasts + replies,
    engagementRate: getEngagementRate(cast),
  };
}

/**
 * Format cast for display
 */
export function formatCastForDisplay(cast: Cast): {
  author: string;
  text: string;
  timestamp: string;
  reactions: string;
} {
  const authorName = cast.author.displayName || cast.author.username || `User ${cast.author.fid}`;
  const stats = getCastStatistics(cast);
  
  return {
    author: authorName,
    text: cast.text,
    timestamp: formatCastTimestamp(cast.timestamp),
    reactions: `${formatReactionCount(stats.likes)} likes • ${formatReactionCount(stats.recasts)} recasts`,
  };
}

/**
 * Serialize cast for storage
 */
export function serializeCast(cast: Cast): string {
  return JSON.stringify({
    hash: cast.hash,
    text: cast.text,
    timestamp: cast.timestamp,
    authorFid: cast.author.fid,
  });
}

/**
 * Deserialize cast from storage
 */
export function deserializeCast(serialized: string): Partial<Cast> | null {
  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

