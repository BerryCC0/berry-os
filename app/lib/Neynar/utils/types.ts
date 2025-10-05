/**
 * Neynar API - Complete Type Definitions
 * Type-safe interfaces for all Neynar functionality
 * 
 * Based on: https://docs.neynar.com/reference/quickstart
 */

/**
 * Farcaster User
 */
export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  profile?: {
    bio?: {
      text?: string;
      mentions?: string[];
    };
  };
  followerCount?: number;
  followingCount?: number;
  verifications?: string[];
  activeStatus?: 'active' | 'inactive';
}

/**
 * Cast (Farcaster post)
 */
export interface Cast {
  hash: string;
  threadHash?: string;
  parentHash?: string;
  parentUrl?: string;
  rootParentUrl?: string;
  parentAuthor?: {
    fid: number;
  };
  author: FarcasterUser;
  text: string;
  timestamp: string;
  embeds?: CastEmbed[];
  reactions?: {
    likes: number;
    recasts: number;
    replies: number;
  };
  replies?: {
    count: number;
  };
  mentionedProfiles?: FarcasterUser[];
  channelKey?: string;
  viewerContext?: {
    liked?: boolean;
    recasted?: boolean;
  };
}

/**
 * Cast embed types
 */
export interface CastEmbed {
  url?: string;
  castId?: {
    fid: number;
    hash: string;
  };
}

/**
 * Reaction types
 */
export type ReactionType = 'like' | 'recast';

/**
 * Reaction
 */
export interface Reaction {
  hash: string;
  reactionTimestamp: string;
  reactionType: ReactionType;
  cast: Cast;
  user: FarcasterUser;
}

/**
 * Follow relationship
 */
export interface Follow {
  user: FarcasterUser;
  followedAt?: string;
}

/**
 * Channel
 */
export interface Channel {
  id: string;
  url: string;
  name: string;
  description?: string;
  imageUrl?: string;
  leadFid?: number;
  followerCount?: number;
  memberCount?: number;
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'follows'
  | 'recasts'
  | 'likes'
  | 'mentions'
  | 'replies';

/**
 * Notification
 */
export interface Notification {
  type: NotificationType;
  id: string;
  timestamp: string;
  actor: FarcasterUser;
  cast?: Cast;
}

/**
 * Feed types
 */
export type FeedType = 'following' | 'filter' | 'channel';

/**
 * Feed options
 */
export interface FeedOptions {
  feedType: FeedType;
  fid?: number;
  channelId?: string;
  filterType?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Signer (for posting casts)
 */
export interface Signer {
  signerUuid: string;
  publicKey: string;
  status: 'pending_approval' | 'approved' | 'revoked';
  fid?: number;
}

/**
 * Cast creation options
 */
export interface CreateCastOptions {
  signerUuid: string;
  text: string;
  parent?: string;
  channelId?: string;
  embeds?: CastEmbedInput[];
  parentAuthorFid?: number;
}

/**
 * Cast embed input
 */
export interface CastEmbedInput {
  url?: string;
  castId?: {
    fid: number;
    hash: string;
  };
}

/**
 * User search options
 */
export interface UserSearchOptions {
  q: string;
  viewerFid?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Cast search options
 */
export interface CastSearchOptions {
  q: string;
  author?: number;
  channelId?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Frame
 */
export interface Frame {
  version: string;
  image: string;
  buttons?: FrameButton[];
  postUrl?: string;
  inputText?: string;
}

/**
 * Frame button
 */
export interface FrameButton {
  index: number;
  title: string;
  actionType?: 'post' | 'post_redirect' | 'link';
  target?: string;
}

/**
 * Webhook
 */
export interface Webhook {
  webhookId: string;
  name: string;
  url: string;
  subscriptions: WebhookSubscription[];
  isActive: boolean;
}

/**
 * Webhook subscription types
 */
export type WebhookSubscription = 
  | 'user.created'
  | 'user.updated'
  | 'cast.created'
  | 'reaction.created'
  | 'follow.created';

/**
 * Storage usage
 */
export interface StorageUsage {
  fid: number;
  unitsUsed: number;
  unitsTotal: number;
}

/**
 * Ban status
 */
export interface BanStatus {
  fid: number;
  isBanned: boolean;
  bannedAt?: string;
  reason?: string;
}

/**
 * Error response
 */
export interface NeynarError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Pagination cursor
 */
export interface PaginatedResponse<T> {
  result: T[];
  next?: {
    cursor?: string;
  };
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: NeynarError;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * FID (Farcaster ID)
 */
export type FID = number;

/**
 * Cast hash
 */
export type CastHash = string;

/**
 * Custom error classes
 */
export class NeynarAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NeynarAPIError';
  }
}

export class ValidationError extends NeynarAPIError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends NeynarAPIError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends NeynarAPIError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends NeynarAPIError {
  constructor(message: string = 'API key is invalid or missing') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

