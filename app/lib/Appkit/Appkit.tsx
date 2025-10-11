/**
 * Reown Appkit Context Provider
 * Wraps the app with Web3 wallet connection functionality
 */

'use client';

import { createAppKit } from '@reown/appkit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { 
  wagmiAdapter, 
  solanaWeb3JsAdapter,
  bitcoinAdapter,
  projectId, 
  metadata, 
  networks 
} from './config';
import { mainnet } from '@reown/appkit/networks';
import type { ReactNode } from 'react';

// Query client for React Query
const queryClient = new QueryClient();

// Create Appkit instance with EVM, Solana, and Bitcoin adapters
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter, bitcoinAdapter],
  projectId,
  networks, // All networks: EVM (Ethereum, Base, BSC, Hyperliquid), Solana, Bitcoin
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: false,
    emailShowWallets: true,
  },
  themeMode: 'light', // Mac OS 8 aesthetic
  themeVariables: {
    '--w3m-font-family': "'Geneva', 'Helvetica', sans-serif",
    '--w3m-accent': '#000000',
    '--w3m-color-mix': '#DDDDDD',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '0px', // Sharp corners for Mac OS 8
  },
});

interface AppkitProps {
  children: ReactNode;
  cookies?: string | null;
}

export function Appkit({ children, cookies }: AppkitProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

