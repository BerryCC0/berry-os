/**
 * Reown AppKit - Wallet Business Logic
 * Pure functions for wallet operations (no React dependencies)
 */

import type { WalletInfo, WalletType } from './types';

/**
 * Get wallet display name
 */
export function getWalletDisplayName(wallet: WalletInfo): string {
  return wallet.name || 'Unknown Wallet';
}

/**
 * Check if wallet is installed
 */
export function isWalletInstalled(wallet: WalletInfo): boolean {
  return wallet.isInstalled === true;
}

/**
 * Get wallet download URL
 */
export function getWalletDownloadUrl(wallet: WalletInfo): string | null {
  return wallet.downloadUrl || null;
}

/**
 * Check if wallet is injected (browser extension)
 */
export function isInjectedWallet(walletType: WalletType): boolean {
  return walletType === 'injected' || walletType === 'metamask';
}

/**
 * Check if wallet is embedded
 */
export function isEmbeddedWallet(walletType: WalletType): boolean {
  return walletType === 'embedded';
}

/**
 * Check if wallet is WalletConnect
 */
export function isWalletConnectWallet(walletType: WalletType): boolean {
  return walletType === 'walletConnect';
}

/**
 * Get wallet icon with fallback
 */
export function getWalletIcon(wallet: WalletInfo): string {
  return wallet.icon || '/icons/wallets/default.svg';
}

/**
 * Format wallet name for display
 */
export function formatWalletName(name: string): string {
  // Capitalize first letter of each word
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Check if wallet supports network
 */
export function supportsNetwork(wallet: WalletInfo, chainId: number | string): boolean {
  // This would require wallet capability data
  // Placeholder implementation
  return true;
}

/**
 * Get wallet type from name
 */
export function getWalletType(name: string): WalletType {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('metamask')) return 'metamask';
  if (nameLower.includes('coinbase')) return 'coinbase';
  if (nameLower.includes('phantom')) return 'phantom';
  if (nameLower.includes('solflare')) return 'solflare';
  if (nameLower.includes('ledger')) return 'ledger';
  if (nameLower.includes('walletconnect')) return 'walletConnect';
  if (nameLower.includes('embedded')) return 'embedded';
  if (nameLower.includes('injected')) return 'injected';
  
  return 'unknown';
}

/**
 * Sort wallets by priority
 */
export function sortWalletsByPriority(wallets: WalletInfo[]): WalletInfo[] {
  const priority: Record<string, number> = {
    metamask: 1,
    coinbase: 2,
    phantom: 3,
    walletConnect: 4,
    embedded: 5,
  };
  
  return [...wallets].sort((a, b) => {
    const aPriority = priority[a.type] || 999;
    const bPriority = priority[b.type] || 999;
    
    // Installed wallets always come first
    if (a.isInstalled && !b.isInstalled) return -1;
    if (!a.isInstalled && b.isInstalled) return 1;
    
    return aPriority - bPriority;
  });
}

/**
 * Filter wallets by type
 */
export function filterWalletsByType(wallets: WalletInfo[], type: WalletType): WalletInfo[] {
  return wallets.filter(w => w.type === type);
}

/**
 * Filter installed wallets
 */
export function getInstalledWallets(wallets: WalletInfo[]): WalletInfo[] {
  return wallets.filter(w => w.isInstalled);
}

/**
 * Get recommended wallets
 */
export function getRecommendedWallets(wallets: WalletInfo[]): WalletInfo[] {
  // Return top 3-5 popular wallets
  const recommended = ['metamask', 'coinbase', 'phantom', 'walletConnect'];
  return wallets.filter(w => recommended.includes(w.type));
}

