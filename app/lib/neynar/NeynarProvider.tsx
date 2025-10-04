/**
 * Neynar Provider Component
 * Client-side context for Neynar functionality
 * 
 * Note: Direct SDK access via neynarClient is server-only.
 * For client components, use API routes to interact with Neynar.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface NeynarContextType {
  // Add client-safe Neynar state/methods here
  // For now, just a placeholder for future client-side Neynar features
  isConfigured: boolean;
}

const NeynarContext = createContext<NeynarContextType | null>(null);

interface NeynarProviderProps {
  children: ReactNode;
}

export function NeynarProvider({ children }: NeynarProviderProps) {
  // Client-safe context - no server-only imports
  const value: NeynarContextType = {
    isConfigured: !!process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID,
  };

  return (
    <NeynarContext.Provider value={value}>
      {children}
    </NeynarContext.Provider>
  );
}

/**
 * Hook to use Neynar context
 * For server-side Neynar operations, use API routes
 */
export function useNeynar() {
  const context = useContext(NeynarContext);
  
  if (!context) {
    throw new Error('useNeynar must be used within NeynarProvider');
  }
  
  return context;
}
