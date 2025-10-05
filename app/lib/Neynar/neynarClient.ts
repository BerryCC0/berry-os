/**
 * Neynar Client Configuration
 * ⚠️ SERVER ONLY - For use in API routes and server components only
 * Based on: https://docs.neynar.com/docs/getting-started-with-neynar
 */

import 'server-only';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Get API key from environment variable (server-side only)
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';

if (!NEYNAR_API_KEY && process.env.NODE_ENV !== 'development') {
  console.warn('NEYNAR_API_KEY not found in environment variables. Set NEYNAR_API_KEY for server-side Farcaster features.');
}

// Initialize Neynar client with configuration
const config = NEYNAR_API_KEY 
  ? new Configuration({ apiKey: NEYNAR_API_KEY })
  : null;

export const neynarClient = config 
  ? new NeynarAPIClient(config)
  : null;

/**
 * Check if Neynar is configured
 */
export function isNeynarConfigured(): boolean {
  return !!NEYNAR_API_KEY;
}

/**
 * Basic Neynar utility functions
 * For more advanced usage, import neynarClient directly
 * ⚠️ Only use in server components or API routes
 */
export const neynar = {
  /**
   * Fetch user data by FID (Farcaster ID)
   * @param fids - Array of FIDs to fetch
   * @param viewerFid - Optional FID of the viewer for context
   */
  async fetchUsers(fids: number[], viewerFid?: number) {
    if (!isNeynarConfigured() || !neynarClient) {
      throw new Error('Neynar API key not configured');
    }
    return neynarClient.fetchBulkUsers({ fids, viewerFid });
  },

  /**
   * Fetch feed for a user
   * @param fid - FID of the user
   * @param feedType - Type of feed (default: 'following')
   * @param limit - Number of casts to fetch (default: 25)
   */
  async fetchFeed(fid: number, feedType: 'following' | 'filter' = 'following', limit: number = 25) {
    if (!isNeynarConfigured() || !neynarClient) {
      throw new Error('Neynar API key not configured');
    }
    return neynarClient.fetchFeed({ 
      feedType: feedType as any, 
      fid, 
      limit 
    });
  },

  /**
   * Lookup user by username
   * @param username - Farcaster username
   */
  async lookupUser(username: string, viewerFid?: number) {
    if (!isNeynarConfigured() || !neynarClient) {
      throw new Error('Neynar API key not configured');
    }
    return neynarClient.lookupUserByUsername({ username, viewerFid });
  },
};
