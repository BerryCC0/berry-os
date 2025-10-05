/**
 * Reown AppKit - Complete Type Definitions
 * Type-safe interfaces for all AppKit functionality
 */

/**
 * Network namespaces (CAIP-2 format)
 */
export type NetworkNamespace = 'eip155' | 'solana' | 'bip122';

/**
 * Connection status
 */
export type ConnectionStatus = 
  | 'connected' 
  | 'connecting' 
  | 'disconnected' 
  | 'reconnecting';

/**
 * Modal views
 */
export type ModalView = 
  | 'Connect'
  | 'Account'
  | 'AllWallets'
  | 'Networks'
  | 'WhatIsANetwork'
  | 'WhatIsAWallet'
  | 'OnRampProviders'
  | 'WalletSend'
  | 'Swap';

/**
 * Wallet types
 */
export type WalletType = 
  | 'injected'
  | 'walletConnect'
  | 'embedded'
  | 'coinbase'
  | 'metamask'
  | 'phantom'
  | 'solflare'
  | 'ledger'
  | 'unknown';

/**
 * Theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Account information
 */
export interface AppKitAccount {
  address: string;
  caipAddress: string;
  isConnected: boolean;
  status: ConnectionStatus;
  chainId?: number;
  namespace?: NetworkNamespace;
}

/**
 * All connected accounts (multichain)
 */
export interface AllAccounts {
  eip155?: AppKitAccount;
  solana?: AppKitAccount;
  bip122?: AppKitAccount;
}

/**
 * Embedded wallet information
 */
export interface EmbeddedWalletInfo {
  email?: string;
  provider?: string;
  isEmailVerified?: boolean;
}

/**
 * Wallet information
 */
export interface WalletInfo {
  name: string;
  icon?: string;
  type: WalletType;
  isInstalled?: boolean;
  downloadUrl?: string;
}

/**
 * Network/Chain information
 */
export interface NetworkInfo {
  chainId: number | string;
  name: string;
  currency: string;
  rpcUrl: string;
  explorerUrl?: string;
  namespace: NetworkNamespace;
  testnet?: boolean;
  iconUrl?: string;
}

/**
 * Balance information
 */
export interface BalanceInfo {
  value: string;
  symbol: string;
  decimals: number;
  formatted: string;
  usdValue?: string;
}

/**
 * Modal state
 */
export interface ModalState {
  open: boolean;
  selectedNetworkId?: number | string;
}

/**
 * AppKit events
 */
export type AppKitEvent = 
  | 'modal_open'
  | 'modal_close'
  | 'connect'
  | 'disconnect'
  | 'account_changed'
  | 'network_changed'
  | 'transaction_sent'
  | 'transaction_confirmed'
  | 'transaction_failed';

/**
 * Event callback
 */
export type EventCallback<T = unknown> = (data: T) => void;

/**
 * Modal open options
 */
export interface OpenModalOptions {
  view?: ModalView;
  namespace?: NetworkNamespace;
  arguments?: SwapArguments;
}

/**
 * Swap arguments
 */
export interface SwapArguments {
  amount?: string;
  fromToken?: string;
  toToken?: string;
}

/**
 * Connect options
 */
export interface ConnectOptions {
  chainId?: number;
  connector?: string;
}

/**
 * Disconnect options
 */
export interface DisconnectOptions {
  logoutUser?: boolean;
}

/**
 * Switch network options
 */
export interface SwitchNetworkOptions {
  chainId: number | string;
}

/**
 * Connection data
 */
export interface ConnectionData {
  connector: string;
  address: string;
  chainId: number | string;
  namespace: NetworkNamespace;
}

/**
 * Multiple connections (multichain)
 */
export type Connections = ConnectionData[];

/**
 * Theme configuration
 */
export interface ThemeConfig {
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
}

/**
 * Theme variables for customization
 */
export interface ThemeVariables {
  '--w3m-font-family'?: string;
  '--w3m-accent'?: string;
  '--w3m-color-mix'?: string;
  '--w3m-color-mix-strength'?: number;
  '--w3m-border-radius-master'?: string;
  [key: string]: string | number | undefined;
}

/**
 * Payment/Exchange types
 */
export interface PaymentOptions {
  asset: string;
  amount: number;
  recipient: string;
  network?: string;
  memo?: string;
}

/**
 * Exchange information
 */
export interface ExchangeInfo {
  id: string;
  name: string;
  iconUrl?: string;
  supported: boolean;
  minAmount?: number;
  maxAmount?: number;
  fees?: {
    fixed?: number;
    percentage?: number;
  };
}

/**
 * Payment status
 */
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Payment result
 */
export interface PaymentResult {
  sessionId: string;
  exchangeId: string;
  status: PaymentStatus;
  transactionHash?: string;
  amount?: number;
  asset?: string;
}

/**
 * Exchange buy status
 */
export interface ExchangeBuyStatus {
  status: PaymentStatus;
  transactionHash?: string;
  amount?: number;
  timestamp?: number;
  error?: string;
}

/**
 * Email update result
 */
export interface EmailUpdateResult {
  email: string;
  verified: boolean;
}

/**
 * SIWX (Sign In With X) configuration
 */
export interface SIWXConfig {
  enabled: boolean;
  protocols: string[];
  domain: string;
  uri: string;
  statement?: string;
  nonce?: () => Promise<string>;
  verifyMessage?: (message: string, signature: string) => Promise<boolean>;
}

/**
 * Provider types for useAppKitProvider
 */
export type ProviderType = 'eip155' | 'solana' | 'bip122';

/**
 * Generic provider interface
 */
export interface Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

/**
 * Solana connection interface
 */
export interface SolanaConnection {
  rpcEndpoint: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  getBalance: (publicKey: unknown) => Promise<number>;
  getLatestBlockhash: () => Promise<{ blockhash: string; lastValidBlockHeight: number }>;
  sendTransaction: (transaction: unknown) => Promise<string>;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Send token options
 */
export interface SendTokenOptions {
  to: string;
  amount: string;
  token?: string; // Token address, undefined for native token
  chainId?: number;
}

/**
 * Swap options
 */
export interface SwapOptions {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
  recipient?: string;
}

/**
 * On-ramp options
 */
export interface OnRampOptions {
  asset: string;
  amount?: number;
  network?: string;
}

/**
 * Error types
 */
export class AppKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppKitError';
  }
}

export class NetworkNotSupportedError extends AppKitError {
  constructor(chainId: number | string) {
    super(
      `Network with chainId ${chainId} is not supported`,
      'NETWORK_NOT_SUPPORTED',
      { chainId }
    );
    this.name = 'NetworkNotSupportedError';
  }
}

export class WalletNotConnectedError extends AppKitError {
  constructor() {
    super(
      'Wallet is not connected',
      'WALLET_NOT_CONNECTED'
    );
    this.name = 'WalletNotConnectedError';
  }
}

export class TransactionRejectedError extends AppKitError {
  constructor(reason?: string) {
    super(
      reason || 'Transaction was rejected by user',
      'TRANSACTION_REJECTED',
      { reason }
    );
    this.name = 'TransactionRejectedError';
  }
}

/**
 * Common chain IDs
 */
export const CHAIN_IDS = {
  // EVM
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  POLYGON: 137,
  
  // Solana
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  
  // Bitcoin
  BITCOIN_MAINNET: 'bip122:000000000019d6689c085ae165831e93',
  BITCOIN_TESTNET: 'bip122:000000000933ea01ad0ee984209779ba',
} as const;

/**
 * Chain names mapping
 */
export const CHAIN_NAMES: Record<number | string, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  8453: 'Base',
  84532: 'Base Sepolia',
  10: 'Optimism',
  42161: 'Arbitrum One',
  137: 'Polygon',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana',
  'bip122:000000000019d6689c085ae165831e93': 'Bitcoin',
};

/**
 * Explorer URLs
 */
export const EXPLORER_URLS: Record<number | string, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  10: 'https://optimistic.etherscan.io',
  42161: 'https://arbiscan.io',
  137: 'https://polygonscan.com',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://explorer.solana.com',
  'bip122:000000000019d6689c085ae165831e93': 'https://blockstream.info',
};

