/**
 * Farcaster Mini App SDK Types
 * Complete type definitions for the SDK
 */

/**
 * User context from Farcaster
 */
export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custody?: string;
  verifications?: string[];
}

/**
 * Location context - where the Mini App was opened from
 */
export interface FarcasterLocation {
  type: 'cast' | 'channel' | 'profile' | 'direct_message' | 'notification' | 'unknown';
  castHash?: string;
  channelKey?: string;
  profileFid?: number;
}

/**
 * Mini App context provided by the SDK
 */
export interface MiniAppContext {
  user: FarcasterUser;
  location: FarcasterLocation;
}

/**
 * SDK Capabilities that hosts may support
 */
export type SDKCapability = 
  | 'actions.ready'
  | 'actions.openUrl'
  | 'actions.close'
  | 'actions.composeCast'
  | 'actions.signin'
  | 'actions.signout'
  | 'actions.viewProfile'
  | 'actions.viewCast'
  | 'actions.viewChannel'
  | 'actions.openMiniApp'
  | 'actions.requestCameraAndMicrophoneAccess'
  | 'wallet.getEthereumProvider'
  | 'wallet.getSolanaProvider';

/**
 * Supported blockchain chains (CAIP-2 format)
 * https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
 */
export type SupportedChain = 
  | 'eip155:1'      // Ethereum Mainnet
  | 'eip155:8453'   // Base
  | 'eip155:10'     // Optimism
  | 'eip155:137'    // Polygon
  | 'eip155:42161'  // Arbitrum
  | 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' // Solana Mainnet
  | string;         // Allow custom chains

/**
 * Open URL action options
 */
export interface OpenUrlOptions {
  url: string;
}

/**
 * Compose cast action options
 */
export interface ComposeCastOptions {
  text?: string;
  embeds?: string[];
  channelKey?: string;
}

/**
 * View profile action options
 */
export interface ViewProfileOptions {
  fid: number;
}

/**
 * View cast action options
 */
export interface ViewCastOptions {
  hash: string;
}

/**
 * View channel action options
 */
export interface ViewChannelOptions {
  channelKey: string;
}

/**
 * Open Mini App action options
 */
export interface OpenMiniAppOptions {
  url: string;
  data?: Record<string, unknown>;
}

/**
 * Ethereum provider interface (EIP-1193)
 */
export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  chainId: string;
  accounts: string[];
}

/**
 * Solana provider interface
 */
export interface SolanaProvider {
  publicKey: {
    toBase58: () => string;
  } | null;
  signAndSendTransaction: (transaction: unknown) => Promise<{ signature: string }>;
  signTransaction: (transaction: unknown) => Promise<unknown>;
  signAllTransactions: (transactions: unknown[]) => Promise<unknown[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect: () => Promise<{ publicKey: unknown }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}

/**
 * SDK Actions interface
 */
export interface SDKActions {
  ready: () => Promise<void>;
  openUrl: (options: OpenUrlOptions) => Promise<void>;
  close: () => Promise<void>;
  composeCast: (options?: ComposeCastOptions) => Promise<void>;
  signin: () => Promise<void>;
  signout: () => Promise<void>;
  viewProfile: (options: ViewProfileOptions) => Promise<void>;
  viewCast: (options: ViewCastOptions) => Promise<void>;
  viewChannel: (options: ViewChannelOptions) => Promise<void>;
  openMiniApp: (options: OpenMiniAppOptions) => Promise<void>;
  requestCameraAndMicrophoneAccess: () => Promise<void>;
}

/**
 * SDK Wallet interface
 */
export interface SDKWallet {
  getEthereumProvider: () => Promise<EthereumProvider>;
  getSolanaProvider: () => Promise<SolanaProvider>;
}

/**
 * Complete SDK interface
 */
export interface MiniAppSDK {
  context: MiniAppContext | null;
  actions: SDKActions;
  wallet: SDKWallet;
  isInMiniApp: () => Promise<boolean>;
  getCapabilities: () => Promise<SDKCapability[]>;
  getChains: () => Promise<SupportedChain[]>;
}

/**
 * SDK Error types
 */
export class MiniAppSDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MiniAppSDKError';
  }
}

export class UnsupportedCapabilityError extends MiniAppSDKError {
  constructor(capability: SDKCapability) {
    super(
      `Capability '${capability}' is not supported by the current host`,
      'UNSUPPORTED_CAPABILITY',
      { capability }
    );
    this.name = 'UnsupportedCapabilityError';
  }
}

export class UnsupportedChainError extends MiniAppSDKError {
  constructor(chain: SupportedChain) {
    super(
      `Chain '${chain}' is not supported by the current host`,
      'UNSUPPORTED_CHAIN',
      { chain }
    );
    this.name = 'UnsupportedChainError';
  }
}

/**
 * Required chains for manifest declaration
 */
export const ETHEREUM_MAINNET: SupportedChain = 'eip155:1';
export const BASE: SupportedChain = 'eip155:8453';
export const OPTIMISM: SupportedChain = 'eip155:10';
export const POLYGON: SupportedChain = 'eip155:137';
export const ARBITRUM: SupportedChain = 'eip155:42161';
export const SOLANA_MAINNET: SupportedChain = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

/**
 * Common capability groups
 */
export const BASIC_CAPABILITIES: SDKCapability[] = [
  'actions.ready',
  'actions.openUrl',
  'actions.close',
];

export const SOCIAL_CAPABILITIES: SDKCapability[] = [
  'actions.composeCast',
  'actions.viewProfile',
  'actions.viewCast',
  'actions.viewChannel',
];

export const AUTH_CAPABILITIES: SDKCapability[] = [
  'actions.signin',
  'actions.signout',
];

export const WALLET_CAPABILITIES: SDKCapability[] = [
  'wallet.getEthereumProvider',
  'wallet.getSolanaProvider',
];

export const MEDIA_CAPABILITIES: SDKCapability[] = [
  'actions.requestCameraAndMicrophoneAccess',
];

