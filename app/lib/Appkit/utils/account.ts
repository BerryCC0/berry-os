/**
 * Reown AppKit - Account Business Logic
 * Pure functions for account management (no React dependencies)
 */

import type {
  AppKitAccount,
  NetworkNamespace,
  ConnectionStatus,
} from './types';

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  
  // Handle different address formats
  if (address.startsWith('0x')) {
    // EVM address
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  } else if (address.length >= 32) {
    // Solana or Bitcoin address
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  }
  
  return address;
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Solana address format (base58)
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Legacy, SegWit, and Taproot formats
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,90}$/.test(address);
}

/**
 * Validate address based on namespace
 */
export function isValidAddress(address: string, namespace: NetworkNamespace): boolean {
  switch (namespace) {
    case 'eip155':
      return isValidEthereumAddress(address);
    case 'solana':
      return isValidSolanaAddress(address);
    case 'bip122':
      return isValidBitcoinAddress(address);
    default:
      return false;
  }
}

/**
 * Parse CAIP-10 account identifier
 * Format: namespace:chainId:address
 */
export function parseCAIP10(caipAddress: string): {
  namespace: string;
  chainId: string;
  address: string;
} | null {
  const parts = caipAddress.split(':');
  if (parts.length !== 3) return null;
  
  const [namespace, chainId, address] = parts;
  return { namespace, chainId, address };
}

/**
 * Build CAIP-10 account identifier
 */
export function buildCAIP10(
  namespace: NetworkNamespace,
  chainId: number | string,
  address: string
): string {
  return `${namespace}:${chainId}:${address}`;
}

/**
 * Check if account is connected
 */
export function isConnected(account: AppKitAccount | null | undefined): account is AppKitAccount {
  return !!(account?.isConnected && account?.address);
}

/**
 * Check if account is connecting
 */
export function isConnecting(status: ConnectionStatus): boolean {
  return status === 'connecting' || status === 'reconnecting';
}

/**
 * Check if account is disconnected
 */
export function isDisconnected(status: ConnectionStatus): boolean {
  return status === 'disconnected';
}

/**
 * Get account display name (shortened address)
 */
export function getAccountDisplayName(account: AppKitAccount, chars: number = 4): string {
  return formatAddress(account.address, chars);
}

/**
 * Get namespace from CAIP address
 */
export function getNamespaceFromCAIP(caipAddress: string): NetworkNamespace | null {
  const parsed = parseCAIP10(caipAddress);
  if (!parsed) return null;
  
  const { namespace } = parsed;
  if (namespace === 'eip155' || namespace === 'solana' || namespace === 'bip122') {
    return namespace as NetworkNamespace;
  }
  
  return null;
}

/**
 * Get chain ID from CAIP address
 */
export function getChainIdFromCAIP(caipAddress: string): string | null {
  const parsed = parseCAIP10(caipAddress);
  return parsed?.chainId || null;
}

/**
 * Get address from CAIP address
 */
export function getAddressFromCAIP(caipAddress: string): string | null {
  const parsed = parseCAIP10(caipAddress);
  return parsed?.address || null;
}

/**
 * Compare two accounts
 */
export function isSameAccount(
  account1: AppKitAccount | null | undefined,
  account2: AppKitAccount | null | undefined
): boolean {
  if (!account1 || !account2) return false;
  
  return (
    account1.address.toLowerCase() === account2.address.toLowerCase() &&
    account1.chainId === account2.chainId &&
    account1.namespace === account2.namespace
  );
}

/**
 * Check if account is on specific network
 */
export function isOnNetwork(
  account: AppKitAccount,
  chainId: number | string
): boolean {
  return account.chainId === chainId;
}

/**
 * Check if account is EVM
 */
export function isEVMAccount(account: AppKitAccount): boolean {
  return account.namespace === 'eip155';
}

/**
 * Check if account is Solana
 */
export function isSolanaAccount(account: AppKitAccount): boolean {
  return account.namespace === 'solana';
}

/**
 * Check if account is Bitcoin
 */
export function isBitcoinAccount(account: AppKitAccount): boolean {
  return account.namespace === 'bip122';
}

/**
 * Get account summary for logging
 */
export function getAccountSummary(account: AppKitAccount): string {
  const namespace = account.namespace || 'unknown';
  const address = formatAddress(account.address, 4);
  const status = account.status;
  const chainId = account.chainId || 'unknown';
  
  return `${namespace}:${chainId} ${address} (${status})`;
}

/**
 * Validate account object
 */
export function isValidAccount(account: unknown): account is AppKitAccount {
  if (!account || typeof account !== 'object') return false;
  
  const acc = account as Record<string, unknown>;
  
  return (
    typeof acc.address === 'string' &&
    typeof acc.caipAddress === 'string' &&
    typeof acc.isConnected === 'boolean' &&
    typeof acc.status === 'string'
  );
}

/**
 * Create account object
 */
export function createAccount(
  address: string,
  chainId: number | string,
  namespace: NetworkNamespace,
  status: ConnectionStatus = 'connected'
): AppKitAccount {
  const caipAddress = buildCAIP10(namespace, chainId, address);
  
  return {
    address,
    caipAddress,
    isConnected: status === 'connected',
    status,
    chainId: typeof chainId === 'string' ? undefined : chainId,
    namespace,
  };
}

/**
 * Serialize account for storage
 */
export function serializeAccount(account: AppKitAccount): string {
  return JSON.stringify({
    address: account.address,
    chainId: account.chainId,
    namespace: account.namespace,
  });
}

/**
 * Deserialize account from storage
 */
export function deserializeAccount(serialized: string): AppKitAccount | null {
  try {
    const data = JSON.parse(serialized);
    
    if (!data.address || !data.namespace) return null;
    
    return createAccount(
      data.address,
      data.chainId,
      data.namespace,
      'disconnected'
    );
  } catch {
    return null;
  }
}

/**
 * Get account blockchain explorer URL
 */
export function getAccountExplorerUrl(
  account: AppKitAccount,
  explorerBaseUrl: string
): string {
  if (account.namespace === 'eip155') {
    return `${explorerBaseUrl}/address/${account.address}`;
  } else if (account.namespace === 'solana') {
    return `${explorerBaseUrl}/address/${account.address}`;
  } else if (account.namespace === 'bip122') {
    return `${explorerBaseUrl}/address/${account.address}`;
  }
  
  return explorerBaseUrl;
}

/**
 * Check if address is checksum valid (EVM only)
 */
export function isChecksumAddress(address: string): boolean {
  // Basic check - proper implementation would use keccak256
  return /^0x[a-fA-F0-9]{40}$/.test(address) && address !== address.toLowerCase();
}

/**
 * Convert address to checksum format (simplified)
 * Note: For production, use proper keccak256-based checksum
 */
export function toChecksumAddress(address: string): string {
  if (!isValidEthereumAddress(address)) return address;
  
  // Simplified checksum - in production, use proper implementation
  // This is just for demonstration
  return address.toLowerCase();
}

/**
 * Truncate address for different contexts
 */
export function truncateAddress(address: string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const chars = style === 'short' ? 4 : style === 'medium' ? 6 : 8;
  return formatAddress(address, chars);
}

/**
 * Get address copy text (formatted for clipboard)
 */
export function getAddressCopyText(account: AppKitAccount): string {
  return account.address;
}

/**
 * Create QR code data for address
 */
export function getAddressQRData(account: AppKitAccount): string {
  // For EVM, use standard ethereum: URI
  if (account.namespace === 'eip155') {
    return `ethereum:${account.address}`;
  }
  
  // For Solana and Bitcoin, just return address
  return account.address;
}

/**
 * Parse address from QR code data
 */
export function parseAddressFromQR(qrData: string): string | null {
  // Handle ethereum: URI
  if (qrData.startsWith('ethereum:')) {
    const address = qrData.replace('ethereum:', '').split(/[@?]/)[0];
    return isValidEthereumAddress(address) ? address : null;
  }
  
  // Handle bitcoin: URI
  if (qrData.startsWith('bitcoin:')) {
    const address = qrData.replace('bitcoin:', '').split(/[?]/)[0];
    return isValidBitcoinAddress(address) ? address : null;
  }
  
  // Try as raw address
  if (isValidEthereumAddress(qrData)) return qrData;
  if (isValidSolanaAddress(qrData)) return qrData;
  if (isValidBitcoinAddress(qrData)) return qrData;
  
  return null;
}

/**
 * Check if two addresses are equal (case-insensitive for EVM)
 */
export function addressesEqual(address1: string, address2: string, namespace: NetworkNamespace): boolean {
  if (namespace === 'eip155') {
    return address1.toLowerCase() === address2.toLowerCase();
  }
  
  return address1 === address2;
}

/**
 * Get account age estimation (mock - would need blockchain data)
 */
export function estimateAccountAge(account: AppKitAccount): string {
  // This would require blockchain data in practice
  // Returning placeholder
  return 'Unknown';
}

/**
 * Check if account needs migration or update
 */
export function needsAccountUpdate(account: AppKitAccount): boolean {
  // Check for old format or missing required fields
  return !account.caipAddress || !account.namespace;
}

/**
 * Migrate old account format to new format
 */
export function migrateAccount(
  address: string,
  chainId: number | string,
  namespace: NetworkNamespace
): AppKitAccount {
  return createAccount(address, chainId, namespace);
}

