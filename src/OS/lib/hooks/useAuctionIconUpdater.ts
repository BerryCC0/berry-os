/**
 * Auction Icon Updater Hook
 * Independent background service that polls the current Noun auction
 * and updates the Auction app icon system-wide
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CURRENT_AUCTION, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { generateNounIconDataURL } from '@/src/Apps/Nouns/Auction/utils/helpers/nounImageHelper';
import { useSystemStore } from '@/src/OS/store/systemStore';

interface AuctionQueryResult {
  auctions: Array<{
    id: string;
    noun: {
      id: string;
      seed: {
        background: string;
        body: string;
        accessory: string;
        head: string;
        glasses: string;
      };
    };
  }>;
}

/**
 * Background service that updates the Auction app icon with the current Noun
 * Polls every 10 seconds to stay in sync with Ethereum blocks (12s) and subgraph indexing
 */
export function useAuctionIconUpdater() {
  const updateAppIcon = useSystemStore((state) => state.updateAppIcon);
  const lastNounIdRef = useRef<string | null>(null);

  // Query current auction with 10-second polling
  const { data, error } = useQuery<AuctionQueryResult>(GET_CURRENT_AUCTION, {
    client: nounsApolloClient,
    pollInterval: 10000, // 10 seconds
    fetchPolicy: 'network-only', // Always fetch fresh data
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (error) {
      console.error('[AuctionIconUpdater] Error fetching current auction:', error);
      return;
    }

    if (!data?.auctions?.[0]) {
      console.warn('[AuctionIconUpdater] No current auction data available');
      return;
    }

    const currentAuction = data.auctions[0];
    const currentNounId = currentAuction.noun.id;

    // Only update if Noun ID has changed (prevents unnecessary re-renders)
    if (lastNounIdRef.current === currentNounId) {
      return;
    }

    try {
      // Generate SVG data URL from Noun seed
      const iconDataURL = generateNounIconDataURL(currentAuction.noun.seed);
      
      // Update system store with new icon
      updateAppIcon('auction', iconDataURL);
      
      // Update ref
      lastNounIdRef.current = currentNounId;
      
      console.log(`[AuctionIconUpdater] Updated auction icon to Noun #${currentNounId}`);
    } catch (err) {
      console.error('[AuctionIconUpdater] Error generating icon:', err);
    }
  }, [data, error, updateAppIcon]);

  // No cleanup needed - polling continues for app lifetime
}

