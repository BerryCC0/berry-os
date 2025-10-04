/**
 * Web3 Configuration
 * Reown Appkit, Wagmi, Solana, Bitcoin, and chain configuration
 */

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { 
  solana, 
  solanaTestnet, 
  solanaDevnet,
  bitcoin,
  bitcoinTestnet
} from '@reown/appkit/networks';
import { 
  mainnet, 
  base, 
  sepolia, 
  baseSepolia 
} from '@reown/appkit/networks';

// Project ID from Reown Cloud (https://cloud.reown.com)
// This should be in env vars for production
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

if (!projectId || projectId === 'YOUR_PROJECT_ID_HERE') {
  console.warn('⚠️ NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Wallet connection will not work properly.');
}

// Metadata for wallet connection
export const metadata = {
  name: 'Berry OS',
  description: 'The operating system for Web3 - EVM, Solana & Bitcoin',
  url: 'https://berryos.xyz',
  icons: ['https://berryos.xyz/icons/apps/berry.svg'],
};

// Determine if we're in development
const isDevelopment = process.env.NODE_ENV === 'development';

// EVM networks
export const evmNetworks = isDevelopment 
  ? [mainnet, base, sepolia, baseSepolia] 
  : [mainnet, base];

// Solana networks
export const solanaNetworks = isDevelopment 
  ? [solana, solanaTestnet, solanaDevnet] 
  : [solana];

// Bitcoin networks
export const bitcoinNetworks = isDevelopment 
  ? [bitcoin, bitcoinTestnet] 
  : [bitcoin];

// All networks combined
export const networks = [...evmNetworks, ...solanaNetworks, ...bitcoinNetworks];

// Set up the Wagmi Adapter (EVM) with Farcaster Mini App connector
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: evmNetworks,
  connectors: [
    farcasterMiniApp(), // Farcaster Mini App wallet connector
  ],
});

// Set up the Solana Adapter
// Wallets (Phantom, Solflare) are automatically included
export const solanaWeb3JsAdapter = new SolanaAdapter();

// Set up the Bitcoin Adapter
export const bitcoinAdapter = new BitcoinAdapter({
  projectId,
});

export const config = wagmiAdapter.wagmiConfig;

