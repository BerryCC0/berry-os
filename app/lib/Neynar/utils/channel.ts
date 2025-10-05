/**
 * Neynar SDK - Channel Utilities
 * 
 * Pure business logic for handling Farcaster channels.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/channel
 */

import type {
  Channel,
  FarcasterUser,
  Cast,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a channel ID
 * 
 * @param id - Channel ID to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidChannelId('nouns') // true
 * isValidChannelId('') // false
 * ```
 */
export function isValidChannelId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0;
}

/**
 * Validates a channel URL
 * 
 * @param url - Channel URL to validate
 * @returns True if valid Warpcast channel URL
 * 
 * @example
 * ```typescript
 * isValidChannelUrl('https://warpcast.com/~/channel/nouns') // true
 * isValidChannelUrl('invalid') // false
 * ```
 */
export function isValidChannelUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'warpcast.com' && parsed.pathname.includes('/channel/');
  } catch {
    return false;
  }
}

/**
 * Extracts channel ID from URL
 * 
 * @param url - Channel URL
 * @returns Channel ID or null
 * 
 * @example
 * ```typescript
 * extractChannelId('https://warpcast.com/~/channel/nouns')
 * // 'nouns'
 * ```
 */
export function extractChannelId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/channel\/([^\/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ============================================================================
// Channel Properties
// ============================================================================

/**
 * Gets channel display name
 * 
 * @param channel - Channel object
 * @returns Display name or ID
 * 
 * @example
 * ```typescript
 * getChannelDisplayName(channel) // 'Nouns DAO'
 * ```
 */
export function getChannelDisplayName(channel: Channel): string {
  return channel.name || channel.id;
}

/**
 * Gets channel description
 * 
 * @param channel - Channel object
 * @returns Description text
 * 
 * @example
 * ```typescript
 * getChannelDescription(channel) // 'Official Nouns DAO channel'
 * ```
 */
export function getChannelDescription(channel: Channel): string {
  return channel.description || '';
}

/**
 * Checks if channel has an image
 * 
 * @param channel - Channel object
 * @returns True if has image URL
 * 
 * @example
 * ```typescript
 * hasChannelImage(channel) // true
 * ```
 */
export function hasChannelImage(channel: Channel): boolean {
  return Boolean(channel.imageUrl && channel.imageUrl.trim().length > 0);
}

/**
 * Gets channel member count
 * 
 * @param channel - Channel object
 * @returns Member count
 * 
 * @example
 * ```typescript
 * getChannelMemberCount(channel) // 1234
 * ```
 */
export function getChannelMemberCount(channel: Channel): number {
  return channel.followerCount || 0;
}

// ============================================================================
// Channel Membership
// ============================================================================

/**
 * Checks if user is channel member/lead
 * 
 * @param channel - Channel object
 * @param fid - User FID
 * @returns True if user is the channel lead
 * 
 * @example
 * ```typescript
 * isChannelMember(channel, 3621) // true
 * ```
 */
export function isChannelMember(channel: Channel, fid: number): boolean {
  if (!channel.leadFid) return false;
  return channel.leadFid === fid;
}

/**
 * Checks if user is channel lead/moderator
 * 
 * @param channel - Channel object
 * @param fid - User FID
 * @returns True if user is the lead
 * 
 * @example
 * ```typescript
 * isChannelLead(channel, 3621) // true
 * ```
 */
export function isChannelLead(channel: Channel, fid: number): boolean {
  if (!channel.leadFid) return false;
  return channel.leadFid === fid;
}

/**
 * Gets channel lead FID
 * 
 * @param channel - Channel object
 * @returns Lead FID or null
 * 
 * @example
 * ```typescript
 * getChannelLead(channel) // 3621
 * ```
 */
export function getChannelLead(channel: Channel): number | null {
  return channel.leadFid || null;
}

// ============================================================================
// Channel Filtering
// ============================================================================

/**
 * Filters channels by search term
 * 
 * @param channels - Channels to filter
 * @param searchTerm - Search term (matches name, id, description)
 * @returns Filtered channels
 * 
 * @example
 * ```typescript
 * const results = searchChannels(channels, 'nouns')
 * ```
 */
export function searchChannels(
  channels: Channel[],
  searchTerm: string
): Channel[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return channels;
  
  return channels.filter(c => 
    c.id.toLowerCase().includes(term) ||
    c.name?.toLowerCase().includes(term) ||
    c.description?.toLowerCase().includes(term)
  );
}

/**
 * Filters channels by minimum member count
 * 
 * @param channels - Channels to filter
 * @param minMembers - Minimum member count
 * @returns Filtered channels
 * 
 * @example
 * ```typescript
 * const popular = filterByMinMembers(channels, 1000)
 * ```
 */
export function filterByMinMembers(
  channels: Channel[],
  minMembers: number
): Channel[] {
  return channels.filter(c => getChannelMemberCount(c) >= minMembers);
}

/**
 * Filters channels by user membership
 * 
 * @param channels - Channels to filter
 * @param fid - User FID
 * @returns Channels where user is a member
 * 
 * @example
 * ```typescript
 * const myChannels = filterByMembership(channels, 3621)
 * ```
 */
export function filterByMembership(
  channels: Channel[],
  fid: number
): Channel[] {
  return channels.filter(c => isChannelMember(c, fid));
}

/**
 * Filters channels where user is a lead
 * 
 * @param channels - Channels to filter
 * @param fid - User FID
 * @returns Channels where user is a lead
 * 
 * @example
 * ```typescript
 * const moderated = filterByLeadership(channels, 3621)
 * ```
 */
export function filterByLeadership(
  channels: Channel[],
  fid: number
): Channel[] {
  return channels.filter(c => isChannelLead(c, fid));
}

// ============================================================================
// Channel Sorting
// ============================================================================

/**
 * Sorts channels by member count (descending)
 * 
 * @param channels - Channels to sort
 * @returns Sorted channels
 * 
 * @example
 * ```typescript
 * const sorted = sortByMemberCount(channels)
 * ```
 */
export function sortByMemberCount(channels: Channel[]): Channel[] {
  return [...channels].sort((a, b) => 
    getChannelMemberCount(b) - getChannelMemberCount(a)
  );
}

/**
 * Sorts channels alphabetically by name
 * 
 * @param channels - Channels to sort
 * @returns Sorted channels
 * 
 * @example
 * ```typescript
 * const sorted = sortByName(channels)
 * ```
 */
export function sortByName(channels: Channel[]): Channel[] {
  return [...channels].sort((a, b) => 
    getChannelDisplayName(a).localeCompare(getChannelDisplayName(b))
  );
}

/**
 * Sorts channels by ID
 * 
 * @param channels - Channels to sort
 * @returns Sorted channels
 * 
 * @example
 * ```typescript
 * const sorted = sortById(channels)
 * ```
 */
export function sortById(channels: Channel[]): Channel[] {
  return [...channels].sort((a, b) => a.id.localeCompare(b.id));
}

// ============================================================================
// Channel URLs
// ============================================================================

/**
 * Builds channel URL
 * 
 * @param channelId - Channel ID
 * @returns Warpcast channel URL
 * 
 * @example
 * ```typescript
 * buildChannelUrl('nouns')
 * // 'https://warpcast.com/~/channel/nouns'
 * ```
 */
export function buildChannelUrl(channelId: string): string {
  return `https://warpcast.com/~/channel/${channelId}`;
}

/**
 * Builds channel API URL
 * 
 * @param channelId - Channel ID
 * @returns Channel API endpoint
 * 
 * @example
 * ```typescript
 * buildChannelApiUrl('nouns')
 * // 'chain://eip155:1/erc721:0x...'
 * ```
 */
export function buildChannelApiUrl(channelId: string): string {
  return `chain://eip155:1/erc721:${channelId}`;
}

// ============================================================================
// Cast Channel Operations
// ============================================================================

/**
 * Checks if cast is in channel
 * 
 * @param cast - Cast object
 * @param channelId - Channel ID
 * @returns True if cast is in channel
 * 
 * @example
 * ```typescript
 * isCastInChannel(cast, 'nouns') // true
 * ```
 */
export function isCastInChannel(cast: Cast, channelId: string): boolean {
  return cast.channelKey === channelId;
}

/**
 * Filters casts by channel
 * 
 * @param casts - Casts to filter
 * @param channelId - Channel ID
 * @returns Casts in channel
 * 
 * @example
 * ```typescript
 * const channelCasts = filterCastsByChannel(casts, 'nouns')
 * ```
 */
export function filterCastsByChannel(
  casts: Cast[],
  channelId: string
): Cast[] {
  return casts.filter(c => isCastInChannel(c, channelId));
}

/**
 * Groups casts by channel
 * 
 * @param casts - Casts to group
 * @returns Map of channel ID to casts
 * 
 * @example
 * ```typescript
 * const grouped = groupCastsByChannel(casts)
 * // { 'nouns': [...], 'art': [...] }
 * ```
 */
export function groupCastsByChannel(casts: Cast[]): Record<string, Cast[]> {
  const grouped: Record<string, Cast[]> = {};
  
  casts.forEach(cast => {
    const channel = cast.channelKey;
    if (channel) {
      if (!grouped[channel]) {
        grouped[channel] = [];
      }
      grouped[channel].push(cast);
    }
  });
  
  return grouped;
}

// ============================================================================
// Channel Statistics
// ============================================================================

/**
 * Gets channel activity score (0-100)
 * 
 * Based on member count and engagement.
 * 
 * @param channel - Channel object
 * @param recentCastCount - Number of recent casts (optional)
 * @returns Activity score
 * 
 * @example
 * ```typescript
 * getChannelActivityScore(channel, 50) // 85
 * ```
 */
export function getChannelActivityScore(
  channel: Channel,
  recentCastCount: number = 0
): number {
  const memberScore = Math.min(Math.log10(getChannelMemberCount(channel) + 1) * 20, 50);
  const activityScore = Math.min(recentCastCount * 2, 50);
  
  return Math.round(memberScore + activityScore);
}

/**
 * Checks if channel is popular (high member count)
 * 
 * @param channel - Channel object
 * @param threshold - Member count threshold (default: 1000)
 * @returns True if popular
 * 
 * @example
 * ```typescript
 * isPopularChannel(channel) // true
 * ```
 */
export function isPopularChannel(
  channel: Channel,
  threshold: number = 1000
): boolean {
  return getChannelMemberCount(channel) >= threshold;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats channel member count
 * 
 * @param count - Member count
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatChannelMemberCount(1234) // '1.2K'
 * formatChannelMemberCount(42) // '42'
 * ```
 */
export function formatChannelMemberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Gets channel summary text
 * 
 * @param channel - Channel object
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getChannelSummary(channel)
 * // 'Nouns DAO • 1.2K members'
 * ```
 */
export function getChannelSummary(channel: Channel): string {
  const name = getChannelDisplayName(channel);
  const memberCount = formatChannelMemberCount(getChannelMemberCount(channel));
  
  return `${name} • ${memberCount} ${getChannelMemberCount(channel) === 1 ? 'member' : 'members'}`;
}

/**
 * Gets channel hashtag
 * 
 * @param channel - Channel object
 * @returns Hashtag string
 * 
 * @example
 * ```typescript
 * getChannelHashtag(channel) // '#nouns'
 * ```
 */
export function getChannelHashtag(channel: Channel): string {
  return `#${channel.id}`;
}

// ============================================================================
// Channel Discovery
// ============================================================================

/**
 * Finds channel by ID
 * 
 * @param channels - Channels to search
 * @param channelId - Channel ID
 * @returns Channel or null
 * 
 * @example
 * ```typescript
 * const channel = findChannelById(channels, 'nouns')
 * ```
 */
export function findChannelById(
  channels: Channel[],
  channelId: string
): Channel | null {
  return channels.find(c => c.id === channelId) || null;
}

/**
 * Finds channel by URL
 * 
 * @param channels - Channels to search
 * @param url - Channel URL
 * @returns Channel or null
 * 
 * @example
 * ```typescript
 * const channel = findChannelByUrl(
 *   channels,
 *   'https://warpcast.com/~/channel/nouns'
 * )
 * ```
 */
export function findChannelByUrl(
  channels: Channel[],
  url: string
): Channel | null {
  return channels.find(c => c.url === url) || null;
}

/**
 * Gets suggested channels for user
 * 
 * Based on channels that user's connections are in.
 * 
 * @param allChannels - All available channels
 * @param userChannels - Channels user is already in
 * @param friendChannels - Channels friends are in
 * @param limit - Number of suggestions
 * @returns Suggested channels
 * 
 * @example
 * ```typescript
 * const suggestions = getSuggestedChannels(
 *   allChannels,
 *   myChannels,
 *   friendChannels,
 *   5
 * )
 * ```
 */
export function getSuggestedChannels(
  allChannels: Channel[],
  userChannels: string[],
  friendChannels: string[],
  limit: number = 10
): Channel[] {
  const userChannelSet = new Set(userChannels);
  const friendChannelCounts = new Map<string, number>();
  
  // Count how many friends are in each channel
  friendChannels.forEach(channelId => {
    if (!userChannelSet.has(channelId)) {
      friendChannelCounts.set(channelId, (friendChannelCounts.get(channelId) || 0) + 1);
    }
  });
  
  // Sort by popularity among friends
  const sortedChannelIds = Array.from(friendChannelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([channelId]) => channelId);
  
  // Return channel objects
  return sortedChannelIds
    .map(id => findChannelById(allChannels, id))
    .filter((c): c is Channel => c !== null);
}

// ============================================================================
// Deduplication
// ============================================================================

/**
 * Deduplicates channels by ID
 * 
 * @param channels - Channels with potential duplicates
 * @returns Unique channels
 * 
 * @example
 * ```typescript
 * const unique = deduplicateChannels(channels)
 * ```
 */
export function deduplicateChannels(channels: Channel[]): Channel[] {
  const seen = new Set<string>();
  return channels.filter(channel => {
    if (seen.has(channel.id)) {
      return false;
    }
    seen.add(channel.id);
    return true;
  });
}

