/**
 * Farcaster Solana Provider
 * Enables Solana wallet functionality in Mini App
 */

'use client';

import { FarcasterSolanaProvider } from '@farcaster/mini-app-solana';
import type { ReactNode } from 'react';

interface SolanaProviderProps {
  children: ReactNode;
}

// Solana RPC endpoint - using a public one
const SOLANA_ENDPOINT = 
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
  'https://solana-rpc.publicnode.com';

export function SolanaProvider({ children }: SolanaProviderProps) {
  return (
    <FarcasterSolanaProvider endpoint={SOLANA_ENDPOINT}>
      {children}
    </FarcasterSolanaProvider>
  );
}

