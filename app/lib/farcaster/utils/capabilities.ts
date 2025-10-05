/**
 * Farcaster Mini App SDK - Capabilities Business Logic
 * Pure functions for checking capabilities and chains (no React dependencies)
 */

import type {
  SDKCapability,
  SupportedChain,
} from './types';

import {
  BASIC_CAPABILITIES,
  SOCIAL_CAPABILITIES,
  AUTH_CAPABILITIES,
  WALLET_CAPABILITIES,
  MEDIA_CAPABILITIES,
} from './types';

/**
 * Check if a capability is in the basic set
 */
export function isBasicCapability(capability: SDKCapability): boolean {
  return BASIC_CAPABILITIES.includes(capability);
}

/**
 * Check if a capability is social-related
 */
export function isSocialCapability(capability: SDKCapability): boolean {
  return SOCIAL_CAPABILITIES.includes(capability);
}

/**
 * Check if a capability is auth-related
 */
export function isAuthCapability(capability: SDKCapability): boolean {
  return AUTH_CAPABILITIES.includes(capability);
}

/**
 * Check if a capability is wallet-related
 */
export function isWalletCapability(capability: SDKCapability): boolean {
  return WALLET_CAPABILITIES.includes(capability);
}

/**
 * Check if a capability is media-related
 */
export function isMediaCapability(capability: SDKCapability): boolean {
  return MEDIA_CAPABILITIES.includes(capability);
}

/**
 * Group capabilities by category
 */
export function groupCapabilities(capabilities: SDKCapability[]): {
  basic: SDKCapability[];
  social: SDKCapability[];
  auth: SDKCapability[];
  wallet: SDKCapability[];
  media: SDKCapability[];
  other: SDKCapability[];
} {
  return {
    basic: capabilities.filter(isBasicCapability),
    social: capabilities.filter(isSocialCapability),
    auth: capabilities.filter(isAuthCapability),
    wallet: capabilities.filter(isWalletCapability),
    media: capabilities.filter(isMediaCapability),
    other: capabilities.filter(
      cap => !isBasicCapability(cap) && 
             !isSocialCapability(cap) && 
             !isAuthCapability(cap) && 
             !isWalletCapability(cap) && 
             !isMediaCapability(cap)
    ),
  };
}

/**
 * Get all possible capabilities (for reference)
 */
export function getAllCapabilities(): SDKCapability[] {
  return [
    ...BASIC_CAPABILITIES,
    ...SOCIAL_CAPABILITIES,
    ...AUTH_CAPABILITIES,
    ...WALLET_CAPABILITIES,
    ...MEDIA_CAPABILITIES,
  ];
}

/**
 * Get minimum required capabilities for a Mini App
 */
export function getMinimumCapabilities(): SDKCapability[] {
  return ['actions.ready'];
}

/**
 * Check if capabilities meet minimum requirements
 */
export function hasMinimumCapabilities(capabilities: SDKCapability[]): boolean {
  return getMinimumCapabilities().every(cap => capabilities.includes(cap));
}

/**
 * Validate capability string format
 */
export function isValidCapability(capability: string): capability is SDKCapability {
  const allCapabilities = getAllCapabilities();
  return allCapabilities.includes(capability as SDKCapability);
}

/**
 * Parse capability from string
 */
export function parseCapability(capability: string): {
  namespace: string;
  method: string;
} {
  const [namespace, method] = capability.split('.');
  return { namespace, method };
}

/**
 * Get required capabilities for wallet interaction
 */
export function getWalletRequiredCapabilities(chain: SupportedChain): SDKCapability[] {
  if (chain.startsWith('eip155:')) {
    return ['wallet.getEthereumProvider'];
  }
  if (chain.startsWith('solana:')) {
    return ['wallet.getSolanaProvider'];
  }
  return [];
}

/**
 * Get required capabilities for social features
 */
export function getSocialRequiredCapabilities(): SDKCapability[] {
  return SOCIAL_CAPABILITIES;
}

/**
 * Check if host supports required capabilities
 */
export function supportsRequiredCapabilities(
  hostCapabilities: SDKCapability[],
  requiredCapabilities: SDKCapability[]
): {
  supported: boolean;
  missing: SDKCapability[];
} {
  const missing = requiredCapabilities.filter(
    cap => !hostCapabilities.includes(cap)
  );
  
  return {
    supported: missing.length === 0,
    missing,
  };
}

/**
 * Parse CAIP-2 chain identifier
 */
export function parseChain(chain: SupportedChain): {
  namespace: string;
  reference: string;
} {
  const [namespace, reference] = chain.split(':');
  return { namespace, reference };
}

/**
 * Check if chain is valid CAIP-2 format
 */
export function isValidChain(chain: string): boolean {
  // CAIP-2: namespace:reference
  const parts = chain.split(':');
  if (parts.length !== 2) return false;
  
  const [namespace, reference] = parts;
  
  // Namespace: lowercase letters
  if (!/^[a-z]+$/.test(namespace)) return false;
  
  // Reference: alphanumeric and some special chars
  if (!/^[a-zA-Z0-9-_.]+$/.test(reference)) return false;
  
  return true;
}

/**
 * Get all supported EVM chains
 */
export function getSupportedEVMChains(): SupportedChain[] {
  return [
    'eip155:1',      // Ethereum Mainnet
    'eip155:8453',   // Base
    'eip155:10',     // Optimism
    'eip155:137',    // Polygon
    'eip155:42161',  // Arbitrum One
  ];
}

/**
 * Get all supported Solana chains
 */
export function getSupportedSolanaChains(): SupportedChain[] {
  return [
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // Solana Mainnet
  ];
}

/**
 * Get all supported chains
 */
export function getAllSupportedChains(): SupportedChain[] {
  return [
    ...getSupportedEVMChains(),
    ...getSupportedSolanaChains(),
  ];
}

/**
 * Check if host supports required chains
 */
export function supportsRequiredChains(
  hostChains: SupportedChain[],
  requiredChains: SupportedChain[]
): {
  supported: boolean;
  missing: SupportedChain[];
} {
  const missing = requiredChains.filter(
    chain => !hostChains.includes(chain)
  );
  
  return {
    supported: missing.length === 0,
    missing,
  };
}

/**
 * Get chain by ID (decimal)
 */
export function getChainById(chainId: number): SupportedChain | null {
  const chain = `eip155:${chainId}`;
  const supported = getSupportedEVMChains();
  return supported.includes(chain) ? chain : null;
}

/**
 * Extract chain ID from CAIP-2
 */
export function extractChainId(chain: SupportedChain): number | null {
  const { namespace, reference } = parseChain(chain);
  
  if (namespace === 'eip155') {
    return parseInt(reference);
  }
  
  return null;
}

/**
 * Group chains by namespace
 */
export function groupChains(chains: SupportedChain[]): {
  evm: SupportedChain[];
  solana: SupportedChain[];
  other: SupportedChain[];
} {
  return {
    evm: chains.filter(c => c.startsWith('eip155:')),
    solana: chains.filter(c => c.startsWith('solana:')),
    other: chains.filter(c => !c.startsWith('eip155:') && !c.startsWith('solana:')),
  };
}

/**
 * Check if Mini App can run on host
 */
export function canRunOnHost(
  hostCapabilities: SDKCapability[],
  hostChains: SupportedChain[],
  requiredCapabilities: SDKCapability[],
  requiredChains: SupportedChain[]
): {
  canRun: boolean;
  missingCapabilities: SDKCapability[];
  missingChains: SupportedChain[];
  reason?: string;
} {
  const capCheck = supportsRequiredCapabilities(hostCapabilities, requiredCapabilities);
  const chainCheck = supportsRequiredChains(hostChains, requiredChains);
  
  const canRun = capCheck.supported && chainCheck.supported;
  
  let reason: string | undefined;
  if (!canRun) {
    if (!capCheck.supported && !chainCheck.supported) {
      reason = 'Missing required capabilities and chains';
    } else if (!capCheck.supported) {
      reason = 'Missing required capabilities';
    } else {
      reason = 'Missing required chains';
    }
  }
  
  return {
    canRun,
    missingCapabilities: capCheck.missing,
    missingChains: chainCheck.missing,
    reason,
  };
}

/**
 * Get feature availability based on capabilities
 */
export function getFeatureAvailability(capabilities: SDKCapability[]): {
  canComposeCast: boolean;
  canViewProfile: boolean;
  canViewCast: boolean;
  canViewChannel: boolean;
  canSignIn: boolean;
  canUseEthereumWallet: boolean;
  canUseSolanaWallet: boolean;
  canUseCameraAndMic: boolean;
} {
  return {
    canComposeCast: capabilities.includes('actions.composeCast'),
    canViewProfile: capabilities.includes('actions.viewProfile'),
    canViewCast: capabilities.includes('actions.viewCast'),
    canViewChannel: capabilities.includes('actions.viewChannel'),
    canSignIn: capabilities.includes('actions.signin'),
    canUseEthereumWallet: capabilities.includes('wallet.getEthereumProvider'),
    canUseSolanaWallet: capabilities.includes('wallet.getSolanaProvider'),
    canUseCameraAndMic: capabilities.includes('actions.requestCameraAndMicrophoneAccess'),
  };
}

/**
 * Get capability suggestions based on feature needs
 */
export function suggestCapabilities(features: {
  needSocial?: boolean;
  needAuth?: boolean;
  needEVMWallet?: boolean;
  needSolanaWallet?: boolean;
  needMedia?: boolean;
}): SDKCapability[] {
  const suggested: SDKCapability[] = [...BASIC_CAPABILITIES];
  
  if (features.needSocial) {
    suggested.push(...SOCIAL_CAPABILITIES);
  }
  
  if (features.needAuth) {
    suggested.push(...AUTH_CAPABILITIES);
  }
  
  if (features.needEVMWallet) {
    suggested.push('wallet.getEthereumProvider');
  }
  
  if (features.needSolanaWallet) {
    suggested.push('wallet.getSolanaProvider');
  }
  
  if (features.needMedia) {
    suggested.push(...MEDIA_CAPABILITIES);
  }
  
  // Remove duplicates
  return Array.from(new Set(suggested));
}

/**
 * Get chain suggestions based on feature needs
 */
export function suggestChains(features: {
  needEVM?: boolean;
  needSolana?: boolean;
  specificChains?: SupportedChain[];
}): SupportedChain[] {
  const suggested: SupportedChain[] = [];
  
  if (features.needEVM) {
    suggested.push('eip155:1'); // Ethereum mainnet as default
  }
  
  if (features.needSolana) {
    suggested.push('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
  }
  
  if (features.specificChains) {
    suggested.push(...features.specificChains);
  }
  
  // Remove duplicates
  return Array.from(new Set(suggested));
}

