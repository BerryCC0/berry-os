/**
 * ProposalCard Component
 * Compact proposal display with vote visualization
 */

'use client';

import { useMemo } from 'react';
import type { UIProposal } from '../../../utils/types/camp';
import {
  getProposalTitle,
  getStatusColor,
  formatProposer,
  getVotePercentages,
  formatVoteCount,
  getTimeRemaining,
  formatStatus,
} from '../../../utils/helpers/proposalHelpers';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import * as proposalUtils from '@/app/lib/Nouns/Goldsky/utils/proposal';
import styles from './ProposalCard.module.css';

interface ProposalCardProps {
  proposal: UIProposal;
  isExpanded?: boolean;
  onClick?: () => void;
}

export default function ProposalCard({ proposal, isExpanded = false, onClick }: ProposalCardProps) {
  const title = getProposalTitle(proposal);
  const statusColor = getStatusColor(proposal.status);
  const status = formatStatus(proposal);
  const proposerAddress = proposalUtils.getProposer(proposal);
  const { ensName: proposerENS } = useENS(proposerAddress);
  const proposer = formatAddressWithENS(proposerAddress, proposerENS);
  const timeRemaining = getTimeRemaining(proposal);
  const votePercentages = getVotePercentages(proposal);

  // Calculate vote bar widths
  const totalVotes = useMemo(() => {
    return parseInt(proposal.forVotes) + parseInt(proposal.againstVotes) + parseInt(proposal.abstainVotes);
  }, [proposal]);

  const forWidth = totalVotes > 0 ? (parseInt(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstWidth = totalVotes > 0 ? (parseInt(proposal.againstVotes) / totalVotes) * 100 : 0;
  const abstainWidth = totalVotes > 0 ? (parseInt(proposal.abstainVotes) / totalVotes) * 100 : 0;

  return (
    <div 
      className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.proposalId}>#{proposal.id}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div 
          className={styles.status}
          style={{ 
            backgroundColor: statusColor,
            color: '#FFFFFF',
          }}
        >
          {status}
        </div>
      </div>

      {/* Vote Bars */}
      <div className={styles.voteBars}>
        {forWidth > 0 && (
          <div 
            className={styles.voteBar}
            style={{
              width: `${forWidth}%`,
              backgroundColor: '#00AA00',
            }}
            title={`For: ${votePercentages.forFormatted}`}
          />
        )}
        {againstWidth > 0 && (
          <div 
            className={styles.voteBar}
            style={{
              width: `${againstWidth}%`,
              backgroundColor: '#AA0000',
            }}
            title={`Against: ${votePercentages.againstFormatted}`}
          />
        )}
        {abstainWidth > 0 && (
          <div 
            className={styles.voteBar}
            style={{
              width: `${abstainWidth}%`,
              backgroundColor: '#888888',
            }}
            title={`Abstain: ${votePercentages.abstainFormatted}`}
          />
        )}
      </div>

      {/* Vote Counts */}
      <div className={styles.voteCounts}>
        <span className={styles.voteFor}>
          ✓ {formatVoteCount(proposal.forVotes)}
        </span>
        <span className={styles.voteAgainst}>
          ✗ {formatVoteCount(proposal.againstVotes)}
        </span>
        <span className={styles.voteAbstain}>
          – {formatVoteCount(proposal.abstainVotes)}
        </span>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.proposer}>
          By {proposer}
        </span>
        {timeRemaining && (
          <span className={styles.timeRemaining}>
            {timeRemaining}
          </span>
        )}
      </div>
    </div>
  );
}

