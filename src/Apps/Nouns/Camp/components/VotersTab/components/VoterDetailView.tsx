/**
 * VoterDetailView Component
 * Detailed view of a voter/delegate with tabs for nouns, votes, and proposals
 */

'use client';

import { useState, useMemo } from 'react';
import { useVoterDetails } from '../../../utils/hooks/useVoterDetails';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { useBatchENS } from '../../../utils/hooks/useBatchENS';
import { useInfiniteScroll } from '../../../utils/hooks/useInfiniteScroll';
import {
  formatVotingPower,
  getVoterStats,
  formatDelegationStatus,
  getVoteDistribution,
  getSupportColor,
  getSupportIcon,
  getSupportLabel,
  formatRelativeTime,
  formatAddress,
} from '../../../utils/helpers/voterHelpers';
import { getNounThumbnails } from '../../../utils/helpers/nounImageHelper';
import Tabs from '@/src/OS/components/UI/Tabs/Tabs';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './VoterDetailView.module.css';

interface VoterDetailViewProps {
  address: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function VoterDetailView({ address, onBack, showBackButton = true }: VoterDetailViewProps) {
  // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
  const { 
    delegate, 
    account, 
    loading, 
    error,
    hasMoreVotes,
    hasMoreProposals,
    hasMoreNouns,
    loadMoreVotes,
    loadMoreProposals,
    loadMoreNouns,
    isLoadingMoreVotes,
    isLoadingMoreProposals,
    isLoadingMoreNouns,
  } = useVoterDetails(address);
  
  const { ensName, ensAvatar } = useENS(address);
  
  // Infinite scroll for each tab
  const { sentinelRef: votesSentinel } = useInfiniteScroll({
    onLoadMore: loadMoreVotes,
    hasMore: hasMoreVotes,
    isLoading: isLoadingMoreVotes,
  });

  const { sentinelRef: proposalsSentinel } = useInfiniteScroll({
    onLoadMore: loadMoreProposals,
    hasMore: hasMoreProposals,
    isLoading: isLoadingMoreProposals,
  });

  const { sentinelRef: nounsSentinel } = useInfiniteScroll({
    onLoadMore: loadMoreNouns,
    hasMore: hasMoreNouns,
    isLoading: isLoadingMoreNouns,
  });

  // Calculate all data that depends on delegate/account
  const stats = delegate ? getVoterStats(delegate, account) : null;
  const delegationStatus = delegate ? formatDelegationStatus(account, delegate) : null;
  const votes = (delegate as any)?.votes || [];
  const proposals = (delegate as any)?.proposals || [];
  const voteDistribution = votes.length > 0 ? getVoteDistribution(votes) : null;
  
  // Batch resolve ENS for all delegators and delegation target
  const delegatorAddresses = useMemo(
    () => {
      const addresses = delegationStatus?.externalDelegators?.map(d => d.address) || [];
      // Add delegation target if user is delegating to someone else
      if (delegationStatus?.isDelegatingTo && !delegationStatus?.isDelegatingToSelf) {
        addresses.push(delegationStatus.isDelegatingTo);
      }
      return addresses;
    },
    [delegationStatus]
  );
  const { ensMap } = useBatchENS(delegatorAddresses);
  
  // Get ENS name for delegation target to use in description
  const delegationTargetEnsName = delegationStatus?.isDelegatingTo 
    ? ensMap.get(delegationStatus.isDelegatingTo.toLowerCase()) ?? null
    : null;
  
  // Derived display values
  const displayName = formatAddressWithENS(address, ensName);
  const avatarUrl = ensAvatar || '/icons/apps/berry.svg';

  // Get Nouns
  const nounsOwned = account?.nouns || [];
  const nounsRepresented = delegate?.nounsRepresented || [];
  
  // Deduplicate by id (since nounsOwned and nounsRepresented may overlap)
  const allNounsMap = new Map();
  [...nounsOwned, ...nounsRepresented].forEach(noun => {
    if (noun && noun.id) {
      allNounsMap.set(noun.id, noun);
    }
  });
  const allNouns = Array.from(allNounsMap.values());

  // Generate thumbnails
  const nounThumbnails = allNouns.length > 0
    ? getNounThumbnails({ nouns: allNouns } as any, allNouns.length).thumbnails
    : [];

  // NOW we can do conditional returns (after all hooks are called)
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Loading voter details...</p>
        </div>
      </div>
    );
  }

  if (error || !delegate || !stats || !delegationStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error loading voter details</p>
          <button onClick={onBack} className={styles.backButton}>
            ← Back to List
          </button>
        </div>
      </div>
    );
  }

  // Overview Tab Content
  const overviewContent = (
    <ScrollBar direction="vertical" className={styles.scrollContent}>
      <div className={styles.overview}>
        {/* Delegation Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Delegation Status</h3>
          <div className={styles.delegationInfo}>
            {/* Show description with ENS name if available */}
            <p className={styles.delegationText}>
              {delegationStatus.isDelegatingTo && !delegationStatus.isDelegatingToSelf && delegationTargetEnsName
                ? `Delegating to ${delegationTargetEnsName}`
                : delegationStatus.description
              }
            </p>
            
            {/* Show who the account is delegating to (with ENS resolution) - only if no ENS name in description */}
            {delegationStatus.isDelegatingTo && !delegationStatus.isDelegatingToSelf && !delegationTargetEnsName && (
              <div className={styles.delegationDetail}>
                <span className={styles.delegationLabel}>Delegating to:</span>
                <span className={styles.delegationValue}>
                  {formatAddressWithENS(delegationStatus.isDelegatingTo, null)}
                </span>
              </div>
            )}
            
            {/* Show self-delegation details only if they are actually self-delegated */}
            {delegationStatus.isSelfDelegated && account?.tokenBalance && Number(account.tokenBalance) > 0 && (
              <div className={styles.delegationDetail}>
                <span className={styles.delegationLabel}>Self-delegating:</span>
                <span className={styles.delegationValue}>
                  {account.tokenBalance} Noun{Number(account.tokenBalance) > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* Show external delegators list only if there are any */}
            {delegationStatus.hasExternalDelegators && (
              <div className={styles.delegatorsSection}>
                <h4 className={styles.delegatorsTitle}>
                  Delegators ({delegationStatus.totalExternalDelegators}):
                </h4>
                <div className={styles.delegatorsList}>
                  {delegationStatus.externalDelegators.slice(0, 10).map((delegator) => {
                    const ensName = ensMap.get(delegator.address.toLowerCase()) ?? null;
                    const displayName = formatAddressWithENS(delegator.address, ensName);
                    
                    return (
                      <div key={delegator.address} className={styles.delegatorItem}>
                        <span className={styles.delegatorAddress} title={delegator.address}>
                          {displayName}
                        </span>
                        <span className={styles.delegatorNouns}>
                          {delegator.nounCount} Noun{delegator.nounCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                  {delegationStatus.totalExternalDelegators > 10 && (
                    <p className={styles.delegatorsMore}>
                      + {delegationStatus.totalExternalDelegators - 10} more...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vote Distribution */}
        {votes.length > 0 && voteDistribution && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Vote Distribution</h3>
            <div className={styles.distribution}>
              <div className={styles.distributionItem}>
                <div className={styles.distributionBar} style={{ backgroundColor: '#00AA00', width: `${voteDistribution.forPercentage}%` }} />
                <span className={styles.distributionLabel}>
                  For: {voteDistribution.forCount} ({voteDistribution.forPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className={styles.distributionItem}>
                <div className={styles.distributionBar} style={{ backgroundColor: '#CC0000', width: `${voteDistribution.againstPercentage}%` }} />
                <span className={styles.distributionLabel}>
                  Against: {voteDistribution.againstCount} ({voteDistribution.againstPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className={styles.distributionItem}>
                <div className={styles.distributionBar} style={{ backgroundColor: '#888888', width: `${voteDistribution.abstainPercentage}%` }} />
                <span className={styles.distributionLabel}>
                  Abstain: {voteDistribution.abstainCount} ({voteDistribution.abstainPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Summary */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activitySummary}>
            <p>Total Votes Cast: <strong>{stats.votescast}</strong></p>
            <p>Proposals Created: <strong>{stats.proposalsCreated}</strong></p>
            <p>Nouns Represented: <strong>{nounsRepresented.length}</strong></p>
          </div>
        </div>
      </div>
    </ScrollBar>
  );

  // Nouns Tab Content
  const nounsContent = (
    <ScrollBar direction="vertical" className={styles.scrollContent}>
      <div className={styles.nounsGrid}>
        {nounThumbnails.length > 0 ? (
          <>
            {nounThumbnails.map((thumbnail) => (
              <div key={thumbnail.id} className={styles.nounCard}>
                <img
                  src={thumbnail.dataURL}
                  alt={`Noun ${thumbnail.id}`}
                  className={styles.nounCardImage}
                />
                <p className={styles.nounCardLabel}>Noun {thumbnail.id}</p>
              </div>
            ))}
            {/* Sentinel for infinite scroll */}
            <div ref={nounsSentinel} className={styles.scrollSentinel} />
            {isLoadingMoreNouns && (
              <div className={styles.loadingMore}>Loading more Nouns...</div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>No Nouns owned or represented</p>
          </div>
        )}
      </div>
    </ScrollBar>
  );

  // Voting History Tab Content
  const votingHistoryContent = (
    <ScrollBar direction="vertical" className={styles.scrollContent}>
      <div className={styles.votesList}>
        {votes.length > 0 ? (
          <>
            {votes.map((vote: any) => (
              <div key={vote.id} className={styles.voteItem}>
                <div className={styles.voteHeader}>
                  <span className={styles.proposalId}>
                    Proposal {vote.proposal?.id || 'Unknown'}
                  </span>
                  {vote.proposal?.title && (
                    <span className={styles.proposalTitle}>{vote.proposal.title}</span>
                  )}
                </div>
                <div className={styles.voteDetails}>
                  <div
                    className={styles.supportBadge}
                    style={{ backgroundColor: getSupportColor(vote.supportDetailed) }}
                  >
                    <span className={styles.supportIcon}>{getSupportIcon(vote.supportDetailed)}</span>
                    <span className={styles.supportLabel}>{getSupportLabel(vote.supportDetailed)}</span>
                  </div>
                  <span className={styles.votesPower}>
                    {formatVotingPower(Number(vote.votes || 0))} votes
                  </span>
                  <span className={styles.voteTime}>
                    {vote.proposal?.createdTimestamp ? formatRelativeTime(vote.proposal.createdTimestamp) : 'Unknown time'}
                  </span>
                </div>
                {vote.reason && (
                  <div className={styles.voteReason}>
                    <p>{vote.reason}</p>
                  </div>
                )}
              </div>
            ))}
            {/* Sentinel for infinite scroll */}
            <div ref={votesSentinel} className={styles.scrollSentinel} />
            {isLoadingMoreVotes && (
              <div className={styles.loadingMore}>Loading more votes...</div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>No votes cast yet</p>
          </div>
        )}
      </div>
    </ScrollBar>
  );

  // Proposals Tab Content
  const proposalsContent = (
    <ScrollBar direction="vertical" className={styles.scrollContent}>
      <div className={styles.proposalsList}>
        {proposals.length > 0 ? (
          <>
            {proposals.map((proposal: any) => (
              <div key={proposal.id} className={styles.proposalItem}>
                <div className={styles.proposalHeader}>
                  <span className={styles.proposalId}>Proposal {proposal.id}</span>
                  <span className={styles.proposalStatus}>{proposal.status || 'Unknown'}</span>
                </div>
                {proposal.title && (
                  <p className={styles.proposalTitle}>{proposal.title}</p>
                )}
                {proposal.createdTimestamp && (
                  <p className={styles.proposalTime}>
                    Created {formatRelativeTime(proposal.createdTimestamp)}
                  </p>
                )}
              </div>
            ))}
            {/* Sentinel for infinite scroll */}
            <div ref={proposalsSentinel} className={styles.scrollSentinel} />
            {isLoadingMoreProposals && (
              <div className={styles.loadingMore}>Loading more proposals...</div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>No proposals created</p>
          </div>
        )}
      </div>
    </ScrollBar>
  );

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: overviewContent,
    },
    {
      id: 'nouns',
      label: `Nouns (${nounThumbnails.length})`,
      content: nounsContent,
    },
    {
      id: 'votes',
      label: `Votes (${votes.length})`,
      content: votingHistoryContent,
    },
    {
      id: 'proposals',
      label: `Proposals (${proposals.length})`,
      content: proposalsContent,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        {showBackButton && onBack && (
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
        )}
        <div className={styles.headerInfo}>
          <img 
            src={avatarUrl} 
            alt={displayName}
            className={styles.headerAvatar}
            onError={(e) => {
              e.currentTarget.src = '/icons/apps/berry.svg';
            }}
          />
          <div className={styles.headerText}>
            <h2 className={styles.headerName}>{displayName}</h2>
            <p className={styles.headerAddress}>{address}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatVotingPower(stats.votingPower)}</span>
          <span className={styles.statLabel}>Voting Power</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.nounsOwned}</span>
          <span className={styles.statLabel}>Nouns Owned</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.tokenHoldersRepresented}</span>
          <span className={styles.statLabel}>Holders Represented</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.proposalsCreated}</span>
          <span className={styles.statLabel}>Proposals Created</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        <Tabs tabs={tabs} lazy />
      </div>
    </div>
  );
}

