/**
 * Nouns Auction
 * Participate in the daily Nouns auction
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CURRENT_AUCTION, GET_AUCTION, GET_NOUN } from '@/app/lib/Nouns/Goldsky/queries';
import { NounsApolloWrapper } from '@/app/lib/Nouns/Goldsky';
import type { Auction as AuctionType, Noun } from '@/app/lib/Nouns/Goldsky/utils/types';
import NounImage from './components/NounImage';
import TraitsList from './components/TraitsList';
import AuctionNavigation from './components/AuctionNavigation';
import BidHistory from './components/BidHistory';
import BidButton from './components/BidButton';
import { 
  formatCountdown, 
  formatTimestamp, 
  getTimeRemaining,
  isNounderNoun,
  formatBidAmount,
  getMinimumNextBid,
  isAuctionActive,
} from './utils/helpers/auctionHelpers';
import styles from './Auction.module.css';

interface AuctionProps {
  windowId: string;
}

interface AuctionQueryResult {
  auctions: AuctionType[];
}

interface SingleAuctionQueryResult {
  auction: AuctionType;
}

interface NounQueryResult {
  noun: Noun;
}

function AuctionContent({ windowId }: AuctionProps) {
  const [viewingNounId, setViewingNounId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Determine if viewing current auction or historical
  const isViewingCurrent = !viewingNounId;

  // Query current auction
  const { 
    data: currentData, 
    loading: currentLoading, 
    error: currentError,
    networkStatus: currentNetworkStatus,
  } = useQuery<AuctionQueryResult>(GET_CURRENT_AUCTION, {
    pollInterval: isViewingCurrent ? 5000 : 0,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // Check if viewing a Nounder Noun
  const isNounder = viewingNounId ? isNounderNoun(viewingNounId) : false;

  // Query historical auction (skip if Nounder Noun)
  const { 
    data: historicalData, 
    loading: historicalLoading,
    networkStatus: historicalNetworkStatus,
  } = useQuery<SingleAuctionQueryResult>(GET_AUCTION, {
    variables: { id: viewingNounId },
    skip: !viewingNounId || isNounder,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // Query Nounder Noun directly (only for Nounder Nouns)
  const {
    data: nounderNounData,
    loading: nounderNounLoading,
    networkStatus: nounderNounNetworkStatus,
  } = useQuery<NounQueryResult>(GET_NOUN, {
    variables: { id: viewingNounId },
    skip: !viewingNounId || !isNounder,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // Get current auction for navigation reference
  const currentAuction = currentData?.auctions?.[0];
  const currentAuctionId = currentAuction?.noun?.id;

  // Determine which auction to display
  const displayAuction = useMemo(() => {
    if (isViewingCurrent) {
      return currentAuction;
    }
    
    // For Nounder Nouns, create a fake auction structure from the Noun data
    if (isNounder && nounderNounData?.noun) {
      return {
        id: nounderNounData.noun.id,
        amount: '0',
        startTime: '0',
        endTime: '0',
        settled: true,
        noun: nounderNounData.noun,
        bids: [],
      } as AuctionType;
    }
    
    return historicalData?.auction || null;
  }, [isViewingCurrent, currentAuction, historicalData, isNounder, nounderNounData]);

  // Only show loading on initial fetch (networkStatus 1), not on polling (networkStatus 6)
  // NetworkStatus: 1 = loading, 6 = poll, 7 = ready, 2 = setVariables
  const isInitialLoad = isViewingCurrent 
    ? (currentNetworkStatus === 1 && !currentData)
    : isNounder
      ? (nounderNounNetworkStatus === 1 && !nounderNounData)
      : (historicalNetworkStatus === 1 && !historicalData);
  
  const loading = isInitialLoad;

  // Update countdown timer for active auctions
  useEffect(() => {
    if (!displayAuction || !isViewingCurrent) return;
    
    const updateCountdown = () => {
      const remaining = getTimeRemaining(displayAuction.endTime);
      setCountdown(formatCountdown(remaining));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, [displayAuction, isViewingCurrent]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    const currentId = viewingNounId || currentAuctionId;
    if (!currentId) return;
    
    const prevId = String(Math.max(1, Number(currentId) - 1));
    setViewingNounId(prevId === currentAuctionId ? null : prevId);
  }, [viewingNounId, currentAuctionId]);

  const handleNext = useCallback(() => {
    if (!viewingNounId || !currentAuctionId) return;
    
    const nextId = String(Math.min(Number(currentAuctionId), Number(viewingNounId) + 1));
    setViewingNounId(nextId === currentAuctionId ? null : nextId);
  }, [viewingNounId, currentAuctionId]);

  const handleSearch = useCallback((nounId: string) => {
    if (!currentAuctionId) return;
    setViewingNounId(nounId === currentAuctionId ? null : nounId);
  }, [currentAuctionId]);

  const handleCurrent = useCallback(() => {
    setViewingNounId(null);
  }, []);

  // Calculate minimum next bid
  const minBidETH = useMemo(() => {
    if (!displayAuction) return '0';
    const minBid = getMinimumNextBid(displayAuction.amount);
    return formatBidAmount(minBid.toString());
  }, [displayAuction]);

  // Get display values
  const nounTitle = useMemo(() => {
    if (loading) return 'Loading...';
    if (!displayAuction) return 'No auction data';
    return `Noun ${displayAuction.noun.id}`;
  }, [loading, displayAuction]);

  const currentBidETH = displayAuction?.amount 
    ? formatBidAmount(displayAuction.amount) 
    : '0';

  const ownerAddress = useMemo(() => {
    // Nounder Nouns always go to nounders.eth
    if (viewingNounId && isNounderNoun(viewingNounId)) {
      return '0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5';
    }
    return displayAuction?.noun?.owner?.id || '';
  }, [viewingNounId, displayAuction]);

  return (
    <div className={styles.auction}>
      <AuctionNavigation
        currentNounId={currentAuctionId || null}
        viewingNounId={viewingNounId}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSearch={handleSearch}
        onCurrent={handleCurrent}
      />

      <div className={styles.content}>
        {/* Left: Noun Image & Traits */}
        <div className={styles.imageSection}>
          <NounImage 
            noun={displayAuction?.noun || null} 
            width={320} 
            height={320}
          />
          <TraitsList noun={displayAuction?.noun || null} loading={loading} />
        </div>

        {/* Right: Auction Details */}
        <div className={styles.detailsSection}>
          <h1 className={styles.title}>
            {nounTitle}
            {viewingNounId && !isNounder && displayAuction?.endTime && (
              <span className={styles.endDate}>
                <span className={styles.endDateLabel}>Auction Ended</span>
                {formatTimestamp(displayAuction.endTime)}
              </span>
            )}
          </h1>

          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>
                {isNounder ? 'Status' : (viewingNounId ? 'Winning Bid' : 'Current Bid')}
              </div>
              <div className={styles.statusValue}>
                {loading ? '\u00A0' : (isNounder ? 'Not Auctioned' : `Ξ ${currentBidETH}`)}
              </div>
            </div>

            {!viewingNounId && displayAuction ? (
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Auction ends in</div>
                <div className={styles.statusValue}>
                  {loading ? '\u00A0' : countdown}
                </div>
              </div>
            ) : (
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Owner</div>
                <div className={styles.statusValue}>
                  {loading ? '\u00A0' : (
                    isNounder ? 'nounders.eth' : `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`
                  )}
                </div>
              </div>
            )}
          </div>

          {!viewingNounId && displayAuction && (
            <BidButton
              nounId={displayAuction.noun.id}
              currentBidETH={currentBidETH}
              minBidETH={minBidETH}
              disabled={!isAuctionActive(displayAuction)}
            />
          )}

          <BidHistory
            bids={displayAuction?.bids || []}
            isNounderNoun={isNounder}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default function Auction(props: AuctionProps) {
  // Wrap in Apollo provider for GraphQL queries
  return (
    <NounsApolloWrapper>
      <AuctionContent {...props} />
    </NounsApolloWrapper>
  );
}
