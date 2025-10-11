/**
 * VotersTab Component
 * Delegates and voters list with voting power
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoters, useVotingPower } from '../../utils/hooks/useVoters';
import { VoterFilter, VoterSort } from '../../utils/types/camp';
import {
  formatVotingPower,
  formatAddress,
  getDelegateDisplayName,
} from '../../utils/helpers/voterHelpers';
import styles from './VotersTab.module.css';

export default function VotersTab() {
  const [filter, setFilter] = useState<VoterFilter>(VoterFilter.ALL);
  const [sort, setSort] = useState<VoterSort>(VoterSort.MOST_POWER);

  const { address, isConnected } = useAccount();
  const { voters, loading, error, hasMore, loadMore } = useVoters({
    first: 20,
    filter,
    sort,
    topOnly: filter === VoterFilter.ALL,
  });

  const { votingPower, delegate, balance, isSelfDelegated, ownsNouns } = useVotingPower(address);

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading voters:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* User's Voting Power (if connected) */}
      {isConnected && (
        <div className={styles.userSection}>
          <h3 className={styles.userTitle}>Your Voting Power</h3>
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Voting Power:</span>
              <span className={styles.statValue}>
                {formatVotingPower(votingPower)} votes
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Nouns Owned:</span>
              <span className={styles.statValue}>
                {balance}
              </span>
            </div>
            {delegate && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Delegated To:</span>
                <span className={styles.statValue}>
                  {isSelfDelegated ? 'Self' : formatAddress(delegate)}
                </span>
              </div>
            )}
          </div>
          {ownsNouns && !isSelfDelegated && (
            <button className={styles.delegateButton}>
              Change Delegation
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Filter:</label>
          <select 
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as VoterFilter)}
          >
            <option value="all">All Delegates</option>
            <option value="active_delegates">Active Delegates</option>
            <option value="token_holders">Token Holders</option>
            <option value="with_votes">With Votes</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Sort:</label>
          <select 
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as VoterSort)}
          >
            <option value="most_power">Most Voting Power</option>
            <option value="most_represented">Most Represented</option>
            <option value="most_votes">Most Votes Cast</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Voters List */}
      <div className={styles.list}>
        {loading && voters.length === 0 ? (
          <div className={styles.loading}>
            <p>Loading delegates...</p>
          </div>
        ) : voters.length === 0 ? (
          <div className={styles.empty}>
            <p>No delegates found</p>
            <p className={styles.emptyHint}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            {voters.map((voter, index) => (
              <div 
                key={voter.id}
                className={`${styles.voterCard} ${voter.isCurrentUser ? styles.currentUser : ''}`}
              >
                <div className={styles.voterHeader}>
                  <span className={styles.voterRank}>#{index + 1}</span>
                  <span className={styles.voterAddress}>
                    {getDelegateDisplayName(voter, voter.ensName)}
                  </span>
                  {voter.isCurrentUser && (
                    <span className={styles.youBadge}>YOU</span>
                  )}
                </div>
                <div className={styles.voterStats}>
                  <div className={styles.voterStat}>
                    <span className={styles.voterStatLabel}>Voting Power:</span>
                    <span className={styles.voterStatValue}>
                      {formatVotingPower(voter.delegatedVotes)} votes
                    </span>
                  </div>
                  <div className={styles.voterStat}>
                    <span className={styles.voterStatLabel}>Nouns:</span>
                    <span className={styles.voterStatValue}>
                      {voter.nounsRepresented?.length || 0}
                    </span>
                  </div>
                  <div className={styles.voterStat}>
                    <span className={styles.voterStatLabel}>Token Holders:</span>
                    <span className={styles.voterStatValue}>
                      {voter.tokenHoldersRepresentedAmount}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <button 
                className={styles.loadMoreButton}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

