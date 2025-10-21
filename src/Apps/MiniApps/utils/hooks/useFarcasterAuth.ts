/**
 * Mini Apps - useFarcasterAuth Hook
 * Wraps the Neynar React SDK authentication context
 * 
 * This hook provides a simple interface to Neynar's SIWN (Sign In With Neynar)
 * authentication that's built into the @neynar/react SDK.
 */

import { useState, useEffect } from 'react';
import { useNeynarContext } from '@neynar/react';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  signer_uuid: string;
}

interface UseFarcasterAuthResult {
  isAuthenticated: boolean;
  fid: number | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  isLoading: boolean;
  signin: () => void;
  signout: () => void;
  isConfigured: boolean;
}

export function useFarcasterAuth(): UseFarcasterAuthResult {
  const neynarContext = useNeynarContext();
  const [userProfile, setUserProfile] = useState<NeynarUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isConfigured = typeof window !== 'undefined' && 
                       !!process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

  // Extract auth state from Neynar context
  const isAuthenticated = neynarContext?.isAuthenticated ?? false;
  const signerUuid = neynarContext?.user?.signer_uuid;
  
  // Fetch user profile from signer UUID
  useEffect(() => {
    if (!isAuthenticated || !signerUuid || userProfile) return;
    
    async function fetchUserProfile() {
      setIsLoading(true);
      try {
        // Fetch user profile from Neynar API via our backend
        const response = await fetch(`/api/auth/neynar/user?signer_uuid=${signerUuid}`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          console.log('Fetched user profile:', data);
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [isAuthenticated, signerUuid, userProfile]);
  
  // Debug logging
  if (typeof window !== 'undefined' && neynarContext) {
    console.log('Neynar Context:', {
      isAuthenticated,
      user: neynarContext.user,
      fullContext: neynarContext
    });
  }
  
  return {
    isAuthenticated,
    fid: userProfile?.fid ?? null,
    username: userProfile?.username ?? null,
    displayName: userProfile?.display_name ?? null,
    pfpUrl: userProfile?.pfp_url ?? null,
    isLoading,
    signin: () => {
      // The SIWN component handles the signin flow
      // This is a placeholder - the actual signin happens via the SIWN button component
      console.log('Use the SIWN button component to sign in');
    },
    signout: () => {
      // Clear Neynar session
      if (typeof window !== 'undefined') {
        // Clear any Neynar SDK storage
        localStorage.removeItem('neynar:user');
        localStorage.removeItem('neynar:token');
        setUserProfile(null);
        // Reload to reset auth state
        window.location.reload();
      }
    },
    isConfigured,
  };
}

