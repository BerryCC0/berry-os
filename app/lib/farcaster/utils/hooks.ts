/**
 * Farcaster Mini App Hooks
 * Convenient hooks for using Mini App features
 * Based on: https://docs.neynar.com/docs/convert-web-app-to-mini-app
 */

'use client';

import { useMemo } from 'react';
import { useMiniApp } from '../MiniAppProvider';
import { isInFarcaster } from '../MiniAppProvider';

// Import business logic utilities
import {
  getDisplayName,
  getUserIdentifier,
  buildMention,
  isFromCast,
  isFromChannel,
  isFromProfile,
  getChannelKey,
  getCastHash,
  getProfileFid,
} from './context';

import type { FarcasterUser, FarcasterLocation, MiniAppContext } from './types';

/**
 * Map SDK user context to our FarcasterUser type
 */
function mapUser(sdkUser: any): FarcasterUser {
  return {
    fid: sdkUser?.fid || 0,
    username: sdkUser?.username,
    displayName: sdkUser?.displayName,
    pfpUrl: sdkUser?.pfpUrl,
    custody: sdkUser?.custody,
    verifications: sdkUser?.verifications || [],
  };
}

/**
 * Map SDK location to our FarcasterLocation type
 */
function mapLocation(sdkLocation: any): FarcasterLocation {
  // Default to unknown if no location
  if (!sdkLocation) {
    return { type: 'unknown' };
  }

  // Map location types
  const type = sdkLocation.type === 'cast_embed' ? 'cast' : sdkLocation.type;
  
  return {
    type: type || 'unknown',
    castHash: sdkLocation.castHash,
    channelKey: sdkLocation.channelKey,
    profileFid: sdkLocation.profileFid,
  };
}

/**
 * Map SDK context to our MiniAppContext type
 */
function mapContext(sdkContext: any): MiniAppContext | null {
  if (!sdkContext || !sdkContext.user) return null;
  
  return {
    user: mapUser(sdkContext.user),
    location: mapLocation(sdkContext.location),
  };
}

/**
 * Hook to get Farcaster user context with utility methods
 */
export function useFarcasterUser() {
  const { context: sdkContext, isSDKLoaded } = useMiniApp();
  
  // Map SDK context to our types
  const context = useMemo(() => mapContext(sdkContext), [sdkContext]);
  const user = context?.user;
  
  // Memoize computed values
  const computedValues = useMemo(() => {
    if (!user) return null;
    
    return {
      formattedDisplayName: getDisplayName(user),
      identifier: getUserIdentifier(user),
      mention: buildMention(user),
      hasVerifiedAddress: (user.verifications?.length || 0) > 0,
      primaryVerification: user.verifications?.[0] || null,
      allVerifications: user.verifications || [],
    };
  }, [user]);
  
  return {
    user,
    fid: user?.fid,
    username: user?.username,
    displayName: user?.displayName,
    pfpUrl: user?.pfpUrl,
    custody: user?.custody,
    verifications: user?.verifications,
    
    // Computed values
    ...computedValues,
    
    isLoaded: isSDKLoaded,
    isInFarcaster: isInFarcaster(),
  };
}

/**
 * Hook to get Mini App location context with utility methods
 */
export function useFarcasterLocation() {
  const { context: sdkContext, isSDKLoaded } = useMiniApp();
  
  // Map SDK context to our types
  const context = useMemo(() => mapContext(sdkContext), [sdkContext]);
  const location = context?.location;
  
  // Memoize computed values
  const computedValues = useMemo(() => {
    if (!location || !context) return null;
    
    return {
      isFromCast: isFromCast(context),
      isFromChannel: isFromChannel(context),
      isFromProfile: isFromProfile(context),
      channelKey: getChannelKey(location),
      castHash: getCastHash(location),
      profileFid: getProfileFid(location),
    };
  }, [location, context]);
  
  return {
    location,
    type: location?.type,
    
    // Computed values
    ...computedValues,
    
    isLoaded: isSDKLoaded,
  };
}

/**
 * Hook to get SDK capabilities and feature availability
 * Note: SDK doesn't expose capabilities/chains directly, so we return null for now
 * Components should check individual action availability
 */
export function useFarcasterCapabilities() {
  // The @neynar/react SDK doesn't expose capabilities/chains directly
  // Return null for now - components should check action availability via actions
  return {
    capabilities: null,
    chains: null,
    features: null,
    groupedCapabilities: null,
  };
}

/**
 * Hook to get SDK actions with safety checks
 */
export function useFarcasterActions() {
  const { actions } = useMiniApp();
  
  // Assume all actions are available when SDK is loaded
  // Components can handle action errors gracefully
  return {
    actions,
    
    // Feature flags - set to true when actions exist
    // Components should still wrap calls in try/catch
    canComposeCast: !!actions,
    canViewProfile: !!actions,
    canViewCast: !!actions,
    canViewChannel: !!actions,
    canSignIn: !!actions,
    canUseEthereumWallet: !!actions,
    canUseSolanaWallet: !!actions,
    canUseCameraAndMic: !!actions,
  };
}

/**
 * Combined hook for all Farcaster Mini App features
 */
export function useFarcasterMiniApp() {
  const miniApp = useMiniApp();
  const user = useFarcasterUser();
  const location = useFarcasterLocation();
  const capabilities = useFarcasterCapabilities();
  const actions = useFarcasterActions();
  
  // Map SDK context to our types for summary
  const context = useMemo(() => mapContext(miniApp.context), [miniApp.context]);
  
  // Context summary for debugging
  const contextSummary = useMemo(() => {
    if (!context) return null;
    try {
      return `${getDisplayName(context.user)} from ${context.location.type}`;
    } catch {
      return null;
    }
  }, [context]);
  
  return {
    ...miniApp,
    context,
    user,
    location,
    capabilities,
    actions,
    contextSummary,
  };
}

/**
 * Hook to detect if running in Mini App environment
 */
export function useIsMiniApp() {
  const { isInMiniApp } = useMiniApp();
  const inFarcaster = isInFarcaster();
  
  return {
    isInMiniApp,
    isInFarcaster: inFarcaster,
    // True if either check passes
    isMiniAppEnvironment: isInMiniApp || inFarcaster,
  };
}

/**
 * Hook for wallet interactions
 */
export function useFarcasterWallet() {
  const { wallet } = useMiniApp();
  
  return {
    wallet,
    canUseEthereumWallet: !!wallet,
    canUseSolanaWallet: !!wallet,
  };
}
