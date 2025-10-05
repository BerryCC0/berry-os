/**
 * Neynar SDK - Search Utilities
 * 
 * Pure business logic for handling Farcaster search operations.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/search
 */

import type {
  FarcasterUser,
  Cast,
  Channel,
} from './types';

// ============================================================================
// Query Processing
// ============================================================================

/**
 * Normalizes search query (trim, lowercase)
 * 
 * @param query - Search query
 * @returns Normalized query
 * 
 * @example
 * ```typescript
 * normalizeQuery('  Hello World  ') // 'hello world'
 * ```
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Validates search query (minimum length)
 * 
 * @param query - Search query
 * @param minLength - Minimum length (default: 1)
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidQuery('abc', 3) // true
 * isValidQuery('ab', 3) // false
 * ```
 */
export function isValidQuery(query: string, minLength: number = 1): boolean {
  return normalizeQuery(query).length >= minLength;
}

/**
 * Extracts hashtags from query
 * 
 * @param query - Search query
 * @returns Array of hashtags
 * 
 * @example
 * ```typescript
 * extractHashtags('Check out #nouns and #crypto')
 * // ['nouns', 'crypto']
 * ```
 */
export function extractHashtags(query: string): string[] {
  const matches = query.match(/#(\w+)/g);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

/**
 * Extracts mentions from query
 * 
 * @param query - Search query
 * @returns Array of usernames
 * 
 * @example
 * ```typescript
 * extractMentions('Hello @alice and @bob')
 * // ['alice', 'bob']
 * ```
 */
export function extractMentions(query: string): string[] {
  const matches = query.match(/@(\w+)/g);
  return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
}

// ============================================================================
// Relevance Scoring
// ============================================================================

/**
 * Calculates text match score (0-100)
 * 
 * @param text - Text to search in
 * @param query - Search query
 * @returns Match score (higher is better)
 * 
 * @example
 * ```typescript
 * getTextMatchScore('hello world', 'hello') // 90
 * getTextMatchScore('hello world', 'goodbye') // 0
 * ```
 */
export function getTextMatchScore(text: string, query: string): number {
  const normalizedText = normalizeQuery(text);
  const normalizedQuery = normalizeQuery(query);
  
  if (!normalizedQuery) return 0;
  
  // Exact match
  if (normalizedText === normalizedQuery) return 100;
  
  // Starts with query
  if (normalizedText.startsWith(normalizedQuery)) return 90;
  
  // Contains query as whole word
  const wordBoundaryRegex = new RegExp(`\\b${normalizedQuery}\\b`);
  if (wordBoundaryRegex.test(normalizedText)) return 80;
  
  // Contains query anywhere
  if (normalizedText.includes(normalizedQuery)) return 60;
  
  // Partial word matches
  const queryWords = normalizedQuery.split(/\s+/);
  const matchingWords = queryWords.filter(word => 
    normalizedText.includes(word)
  );
  
  if (matchingWords.length > 0) {
    return Math.round((matchingWords.length / queryWords.length) * 50);
  }
  
  return 0;
}

/**
 * Calculates user relevance score (0-100)
 * 
 * @param user - User object
 * @param query - Search query
 * @returns Relevance score
 * 
 * @example
 * ```typescript
 * getUserRelevanceScore(user, 'alice') // 95
 * ```
 */
export function getUserRelevanceScore(user: FarcasterUser, query: string): number {
  let score = 0;
  
  // Username match (highest weight)
  if (user.username) {
    const usernameScore = getTextMatchScore(user.username, query);
    score += usernameScore * 0.6;
  }
  
  // Display name match
  if (user.displayName) {
    const displayNameScore = getTextMatchScore(user.displayName, query);
    score += displayNameScore * 0.3;
  }
  
  // Bio match (lowest weight)
  if (user.profile?.bio?.text) {
    const bioScore = getTextMatchScore(user.profile.bio.text, query);
    score += bioScore * 0.1;
  }
  
  return Math.round(score);
}

/**
 * Calculates cast relevance score (0-100)
 * 
 * @param cast - Cast object
 * @param query - Search query
 * @returns Relevance score
 * 
 * @example
 * ```typescript
 * getCastRelevanceScore(cast, 'nouns') // 85
 * ```
 */
export function getCastRelevanceScore(cast: Cast, query: string): number {
  let score = getTextMatchScore(cast.text, query);
  
  // Boost for recent casts
  const hoursSincePosted = (Date.now() - new Date(cast.timestamp).getTime()) / (1000 * 60 * 60);
  if (hoursSincePosted < 24) {
    score += 10;
  } else if (hoursSincePosted < 168) { // 1 week
    score += 5;
  }
  
  // Boost for engagement
  const likes = cast.reactions?.likes || 0;
  const recasts = cast.reactions?.recasts || 0;
  const engagement = likes + (recasts * 2);
  
  if (engagement > 100) score += 15;
  else if (engagement > 50) score += 10;
  else if (engagement > 10) score += 5;
  
  return Math.min(100, Math.round(score));
}

/**
 * Calculates channel relevance score (0-100)
 * 
 * @param channel - Channel object
 * @param query - Search query
 * @returns Relevance score
 * 
 * @example
 * ```typescript
 * getChannelRelevanceScore(channel, 'nouns') // 90
 * ```
 */
export function getChannelRelevanceScore(channel: Channel, query: string): number {
  let score = 0;
  
  // ID match (highest weight)
  const idScore = getTextMatchScore(channel.id, query);
  score += idScore * 0.5;
  
  // Name match
  if (channel.name) {
    const nameScore = getTextMatchScore(channel.name, query);
    score += nameScore * 0.3;
  }
  
  // Description match
  if (channel.description) {
    const descScore = getTextMatchScore(channel.description, query);
    score += descScore * 0.2;
  }
  
  return Math.round(score);
}

// ============================================================================
// Filtering by Relevance
// ============================================================================

/**
 * Filters users by search query
 * 
 * @param users - Users to search
 * @param query - Search query
 * @param minScore - Minimum relevance score
 * @returns Filtered users
 * 
 * @example
 * ```typescript
 * const results = filterUsersByQuery(users, 'alice', 50)
 * ```
 */
export function filterUsersByQuery(
  users: FarcasterUser[],
  query: string,
  minScore: number = 50
): FarcasterUser[] {
  return users.filter(user => 
    getUserRelevanceScore(user, query) >= minScore
  );
}

/**
 * Filters casts by search query
 * 
 * @param casts - Casts to search
 * @param query - Search query
 * @param minScore - Minimum relevance score
 * @returns Filtered casts
 * 
 * @example
 * ```typescript
 * const results = filterCastsByQuery(casts, 'nouns', 50)
 * ```
 */
export function filterCastsByQuery(
  casts: Cast[],
  query: string,
  minScore: number = 50
): Cast[] {
  return casts.filter(cast => 
    getCastRelevanceScore(cast, query) >= minScore
  );
}

/**
 * Filters channels by search query
 * 
 * @param channels - Channels to search
 * @param query - Search query
 * @param minScore - Minimum relevance score
 * @returns Filtered channels
 * 
 * @example
 * ```typescript
 * const results = filterChannelsByQuery(channels, 'nouns', 50)
 * ```
 */
export function filterChannelsByQuery(
  channels: Channel[],
  query: string,
  minScore: number = 50
): Channel[] {
  return channels.filter(channel => 
    getChannelRelevanceScore(channel, query) >= minScore
  );
}

// ============================================================================
// Sorting by Relevance
// ============================================================================

/**
 * Sorts users by relevance to query
 * 
 * @param users - Users to sort
 * @param query - Search query
 * @returns Sorted users
 * 
 * @example
 * ```typescript
 * const sorted = sortUsersByRelevance(users, 'alice')
 * ```
 */
export function sortUsersByRelevance(
  users: FarcasterUser[],
  query: string
): FarcasterUser[] {
  return [...users].sort((a, b) => 
    getUserRelevanceScore(b, query) - getUserRelevanceScore(a, query)
  );
}

/**
 * Sorts casts by relevance to query
 * 
 * @param casts - Casts to sort
 * @param query - Search query
 * @returns Sorted casts
 * 
 * @example
 * ```typescript
 * const sorted = sortCastsByRelevance(casts, 'nouns')
 * ```
 */
export function sortCastsByRelevance(
  casts: Cast[],
  query: string
): Cast[] {
  return [...casts].sort((a, b) => 
    getCastRelevanceScore(b, query) - getCastRelevanceScore(a, query)
  );
}

/**
 * Sorts channels by relevance to query
 * 
 * @param channels - Channels to sort
 * @param query - Search query
 * @returns Sorted channels
 * 
 * @example
 * ```typescript
 * const sorted = sortChannelsByRelevance(channels, 'nouns')
 * ```
 */
export function sortChannelsByRelevance(
  channels: Channel[],
  query: string
): Channel[] {
  return [...channels].sort((a, b) => 
    getChannelRelevanceScore(b, query) - getChannelRelevanceScore(a, query)
  );
}

// ============================================================================
// Search with Ranking
// ============================================================================

/**
 * Searches and ranks users
 * 
 * @param users - Users to search
 * @param query - Search query
 * @param limit - Maximum results
 * @returns Ranked users
 * 
 * @example
 * ```typescript
 * const results = searchUsers(users, 'alice', 10)
 * ```
 */
export function searchUsers(
  users: FarcasterUser[],
  query: string,
  limit: number = 20
): FarcasterUser[] {
  const filtered = filterUsersByQuery(users, query);
  const sorted = sortUsersByRelevance(filtered, query);
  return sorted.slice(0, limit);
}

/**
 * Searches and ranks casts
 * 
 * @param casts - Casts to search
 * @param query - Search query
 * @param limit - Maximum results
 * @returns Ranked casts
 * 
 * @example
 * ```typescript
 * const results = searchCasts(casts, 'nouns', 25)
 * ```
 */
export function searchCasts(
  casts: Cast[],
  query: string,
  limit: number = 25
): Cast[] {
  const filtered = filterCastsByQuery(casts, query);
  const sorted = sortCastsByRelevance(filtered, query);
  return sorted.slice(0, limit);
}

/**
 * Searches and ranks channels
 * 
 * @param channels - Channels to search
 * @param query - Search query
 * @param limit - Maximum results
 * @returns Ranked channels
 * 
 * @example
 * ```typescript
 * const results = searchChannels(channels, 'nouns', 10)
 * ```
 */
export function searchChannels(
  channels: Channel[],
  query: string,
  limit: number = 10
): Channel[] {
  const filtered = filterChannelsByQuery(channels, query);
  const sorted = sortChannelsByRelevance(filtered, query);
  return sorted.slice(0, limit);
}

// ============================================================================
// Highlighting
// ============================================================================

/**
 * Highlights query matches in text
 * 
 * @param text - Text to highlight in
 * @param query - Search query
 * @param highlightTag - HTML tag to wrap matches (default: 'mark')
 * @returns Text with highlighted matches
 * 
 * @example
 * ```typescript
 * highlightMatches('hello world', 'world')
 * // 'hello <mark>world</mark>'
 * ```
 */
export function highlightMatches(
  text: string,
  query: string,
  highlightTag: string = 'mark'
): string {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return text;
  
  const regex = new RegExp(`(${normalizedQuery})`, 'gi');
  return text.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
}

