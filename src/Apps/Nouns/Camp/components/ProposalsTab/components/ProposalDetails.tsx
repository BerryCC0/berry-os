/**
 * ProposalDetails Component
 * Full proposal view with voting interface
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { UIProposal } from '../../../utils/types/camp';
import {
  getProposalTitle,
  getStatusColor,
  formatStatus,
  getVotePercentages,
  getQuorumStatus,
  formatVoteCount,
  getActionCount,
  formatProposer,
  formatTimestamp,
  estimateBlockTimestamp,
  isProposalUpdatable,
} from '../../../utils/helpers/proposalHelpers';
import { useHasVoted, useProposalVotes } from '../../../utils/hooks/useProposals';
import { useProposalFeedback } from '../../../utils/hooks/useProposalFeedback';
import { useProposalVersions } from '../../../utils/hooks/useProposalVersions';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { filterVotesBySupport } from '../../../utils/helpers/voterHelpers';
import * as proposalUtils from '@/app/lib/Nouns/Goldsky/utils/proposal';
import VotesList from './VotesList';
import FeedbackList from './FeedbackList';
import ProposalVersionHistory from './ProposalVersionHistory';
import ProposalActions from './ProposalActions';
import MarkdownRenderer from './MarkdownRenderer';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './ProposalDetails.module.css';

interface ProposalDetailsProps {
  proposal: UIProposal;
  onClose?: () => void;
  onVote?: (support: number, reason?: string) => void;
  onEdit?: (proposalId: string) => void;
  defaultSummaryCollapsed?: boolean; // Control initial collapsed state
}

export default function ProposalDetails({ proposal, onClose, onVote, onEdit, defaultSummaryCollapsed = false }: ProposalDetailsProps) {
  const { address, isConnected } = useAccount();
  const { hasVoted, voteSupport } = useHasVoted(proposal.id, address);
  
  // Check if user can edit this proposal
  const canEdit = isProposalUpdatable(proposal, address);
  
  const [voteReason, setVoteReason] = useState('');
  const [selectedSupport, setSelectedSupport] = useState<number | null>(null);
  const [voteFilter, setVoteFilter] = useState<'all' | 'for' | 'against' | 'abstain'>('all');
  const [isFeedbackCollapsed, setIsFeedbackCollapsed] = useState(true);
  const [isVersionsCollapsed, setIsVersionsCollapsed] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(defaultSummaryCollapsed);
  const [activeTab, setActiveTab] = useState<'description' | 'votes'>('description');
  
  // Fetch individual votes
  const { votes, loading: votesLoading, hasMore: hasMoreVotes, loadMore: loadMoreVotes } = useProposalVotes(proposal.id, { first: 20 });
  
  // Fetch feedback signals
  const { feedback, loading: feedbackLoading, hasFeedback } = useProposalFeedback(proposal.id);
  
  // Fetch proposal versions (V3 governance - updatable proposals)
  const { versions, hasVersions } = useProposalVersions(proposal.id);

  const title = getProposalTitle(proposal);
  const statusColor = getStatusColor(proposal.status);
  const status = formatStatus(proposal);
  const votePercentages = getVotePercentages(proposal);
  const quorumStatus = getQuorumStatus(proposal);
  const actionsCount = getActionCount(proposal);
  
  // ENS resolution for proposer
  const proposerAddress = proposalUtils.getProposer(proposal);
  const { ensName: proposerENS } = useENS(proposerAddress);
  const proposer = formatAddressWithENS(proposerAddress, proposerENS);

  // Calculate timestamps for metadata display
  const createdTimestamp = parseInt(proposal.createdTimestamp);
  const startTimestamp = estimateBlockTimestamp(
    proposal.startBlock,
    proposal.createdBlock,
    proposal.createdTimestamp
  );
  const endTimestamp = estimateBlockTimestamp(
    proposal.endBlock,
    proposal.createdBlock,
    proposal.createdTimestamp
  );

  const canVote = isConnected && !hasVoted && proposal.status === 'ACTIVE';

  const handleVote = (support: number) => {
    setSelectedSupport(support);
  };

  const handleSubmitVote = () => {
    if (selectedSupport !== null && onVote) {
      onVote(selectedSupport, voteReason || undefined);
      setSelectedSupport(null);
      setVoteReason('');
    }
  };

  const getSupportLabel = (support: number): string => {
    switch (support) {
      case 0: return 'Against';
      case 1: return 'For';
      case 2: return 'Abstain';
      default: return 'Unknown';
    }
  };

  // Filter votes by selected tab
  const filteredVotes = filterVotesBySupport(votes, voteFilter);

  return (
    <div className={styles.details}>
      {/* Edit Button (if updatable by user) */}
      {canEdit && onEdit && (
        <div className={styles.editSection}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(proposal.id)}
            title="Edit this proposal during the updatable period"
          >
            ✏️ Edit Proposal
          </button>
          <p className={styles.editHint}>
            This proposal is in the updatable period. You can edit the transactions and description.
          </p>
        </div>
      )}

      {/* Collapsible Vote Summary & Transactions Section */}
      <div className={styles.summarySection}>
        {/* Summary Header with Toggle */}
        <button
          className={styles.summaryHeader}
          onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
          aria-expanded={!isSummaryCollapsed}
        >
          <h3 className={styles.summaryTitle}>Vote Summary & Transactions</h3>
          <span className={styles.expandIcon}>{isSummaryCollapsed ? '+' : '−'}</span>
        </button>

        {/* Summary Content (collapsible) */}
        {!isSummaryCollapsed && (
          <div className={styles.summaryContent}>
            {/* Proposal Metadata */}
            <div className={styles.metadata}>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Proposer:</span>
                <span className={styles.metadataValue} title={proposerAddress}>{proposer}</span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Created:</span>
                <span 
                  className={styles.metadataValue} 
                  title={`Block ${proposal.createdBlock}`}
                >
                  {formatTimestamp(createdTimestamp)}
                </span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Voting Period:</span>
                <span 
                  className={styles.metadataValue}
                  title={`Block ${proposal.startBlock} - ${proposal.endBlock}`}
                >
                  {formatTimestamp(startTimestamp)} - {formatTimestamp(endTimestamp)}
                </span>
              </div>
            </div>

            {/* Vote Summary */}
            <div className={styles.voteSection}>
        <h3 className={styles.sectionTitle}>Votes</h3>
        
        {/* Vote Bars */}
        <div className={styles.voteBarContainer}>
          <div className={styles.voteBarRow}>
            <span className={styles.voteLabel}>For</span>
            <div className={styles.voteBarWrapper}>
              <div 
                className={styles.voteBarFill}
                style={{ 
                  width: `${votePercentages.for}%`,
                  backgroundColor: '#00AA00',
                }}
              />
            </div>
            <span className={styles.voteValue}>
              {formatVoteCount(proposal.forVotes)} ({votePercentages.forFormatted})
            </span>
          </div>

          <div className={styles.voteBarRow}>
            <span className={styles.voteLabel}>Against</span>
            <div className={styles.voteBarWrapper}>
              <div 
                className={styles.voteBarFill}
                style={{ 
                  width: `${votePercentages.against}%`,
                  backgroundColor: '#AA0000',
                }}
              />
            </div>
            <span className={styles.voteValue}>
              {formatVoteCount(proposal.againstVotes)} ({votePercentages.againstFormatted})
            </span>
          </div>

          <div className={styles.voteBarRow}>
            <span className={styles.voteLabel}>Abstain</span>
            <div className={styles.voteBarWrapper}>
              <div 
                className={styles.voteBarFill}
                style={{ 
                  width: `${votePercentages.abstain}%`,
                  backgroundColor: '#888888',
                }}
              />
            </div>
            <span className={styles.voteValue}>
              {formatVoteCount(proposal.abstainVotes)} ({votePercentages.abstainFormatted})
            </span>
          </div>
        </div>

        {/* Quorum Status */}
        <div className={styles.quorumStatus}>
          <span className={quorumStatus.hasQuorum ? styles.quorumMet : styles.quorumNotMet}>
            {quorumStatus.hasQuorum ? '✓' : '○'} Quorum: {quorumStatus.formatted}
          </span>
        </div>

        {/* User Vote Status */}
        {hasVoted && voteSupport !== null && (
          <div className={styles.userVoteStatus}>
            You voted: <strong>{getSupportLabel(voteSupport)}</strong>
          </div>
        )}
      </div>

      {/* Proposal Actions */}
      <ProposalActions proposal={proposal} />
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className={styles.contentTabs}>
        <button
          className={`${styles.contentTab} ${activeTab === 'description' ? styles.active : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          className={`${styles.contentTab} ${activeTab === 'votes' ? styles.active : ''}`}
          onClick={() => setActiveTab('votes')}
        >
          Votes & Signals
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'description' ? (
        <>
          {/* Description */}
          <div className={styles.descriptionSection}>
            <ScrollBar direction="vertical" showArrows={false}>
              <div className={styles.descriptionContent}>
                <MarkdownRenderer content={proposal.description || ''} />
              </div>
            </ScrollBar>
          </div>
        </>
      ) : (
        <>
          {/* Voting Interface - Full Width Above Columns */}
          {canVote && (
            <div className={styles.votingSection}>
              <h3 className={styles.sectionTitle}>Cast Your Vote</h3>
              
              <div className={styles.voteButtons}>
                <button
                  className={`${styles.voteButton} ${styles.voteFor} ${selectedSupport === 1 ? styles.selected : ''}`}
                  onClick={() => handleVote(1)}
                >
                  Vote For
                </button>
                <button
                  className={`${styles.voteButton} ${styles.voteAgainst} ${selectedSupport === 0 ? styles.selected : ''}`}
                  onClick={() => handleVote(0)}
                >
                  Vote Against
                </button>
                <button
                  className={`${styles.voteButton} ${styles.voteAbstain} ${selectedSupport === 2 ? styles.selected : ''}`}
                  onClick={() => handleVote(2)}
                >
                  Abstain
                </button>
              </div>

              {selectedSupport !== null && (
                <>
                  <textarea
                    className={styles.reasonInput}
                    placeholder="Add a reason for your vote (optional)"
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                  <button
                    className={styles.submitButton}
                    onClick={handleSubmitVote}
                  >
                    Submit Vote
                  </button>
                </>
              )}
            </div>
          )}

          {!isConnected && proposal.status === 'ACTIVE' && (
            <div className={styles.connectPrompt}>
              Connect your wallet to vote on this proposal
            </div>
          )}

          {/* Two-Column Layout: Votes and Signals */}
          <div className={styles.votesAndSignalsContainer}>
            {/* Left Column: Individual Votes Section */}
            <div className={styles.votesColumn}>
            <div className={styles.votesSection}>
              <h3 className={styles.sectionTitle}>Individual Votes</h3>
              
              {/* Vote Filter Tabs */}
              <div className={styles.voteTabs}>
                <button
                  className={`${styles.voteTab} ${voteFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setVoteFilter('all')}
                >
                  All ({votes.length})
                </button>
                <button
                  className={`${styles.voteTab} ${voteFilter === 'for' ? styles.active : ''}`}
                  onClick={() => setVoteFilter('for')}
                >
                  For ({filterVotesBySupport(votes, 'for').length})
                </button>
                <button
                  className={`${styles.voteTab} ${voteFilter === 'against' ? styles.active : ''}`}
                  onClick={() => setVoteFilter('against')}
                >
                  Against ({filterVotesBySupport(votes, 'against').length})
                </button>
                <button
                  className={`${styles.voteTab} ${voteFilter === 'abstain' ? styles.active : ''}`}
                  onClick={() => setVoteFilter('abstain')}
                >
                  Abstain ({filterVotesBySupport(votes, 'abstain').length})
                </button>
              </div>

              {/* Votes List */}
              <VotesList
                votes={filteredVotes}
                loading={votesLoading}
                onLoadMore={loadMoreVotes}
                hasMore={hasMoreVotes}
              />
            </div>
          </div>

          {/* Right Column: Feedback Signals (V3 Governance) */}
          {hasFeedback && (
            <div className={styles.signalsColumn}>
              <FeedbackList
                feedback={feedback}
                isCollapsed={isFeedbackCollapsed}
                onToggle={() => setIsFeedbackCollapsed(!isFeedbackCollapsed)}
              />
            </div>
          )}
          </div>
        </>
      )}

      {/* Proposal Version History (V3 Governance - Updatable Proposals) */}
      {hasVersions && (
        <ProposalVersionHistory
          versions={versions}
          isCollapsed={isVersionsCollapsed}
          onToggle={() => setIsVersionsCollapsed(!isVersionsCollapsed)}
        />
      )}
    </div>
  );
}

