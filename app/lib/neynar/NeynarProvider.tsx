/**
 * Neynar Provider Component
 * Simple context provider for Farcaster/Neynar functionality
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { neynar, neynarClient, isNeynarConfigured } from './neynarClient';

interface NeynarContextType {
  neynar: typeof neynar;
  client: typeof neynarClient;
  isConfigured: boolean;
}

const NeynarContext = createContext<NeynarContextType | null>(null);

interface NeynarProviderProps {
  children: ReactNode;
}

export function NeynarProvider({ children }: NeynarProviderProps) {
  const value: NeynarContextType = {
    neynar,
    client: neynarClient,
    isConfigured: isNeynarConfigured(),
  };

  return (
    <NeynarContext.Provider value={value}>
      {children}
    </NeynarContext.Provider>
  );
}

/**
 * Hook to use Neynar context
 */
export function useNeynar() {
  const context = useContext(NeynarContext);
  
  if (!context) {
    throw new Error('useNeynar must be used within NeynarProvider');
  }
  
  return context;
}
