/**
 * ProposalDetailsWrapper Component
 * Fetches proposal data and renders ProposalDetails for Activity items
 */

'use client';

import { useProposal } from '../../../utils/hooks/useProposals';
import ProposalDetails from '../../ProposalsTab/components/ProposalDetails';
import styles from './ProposalDetailsWrapper.module.css';

interface ProposalDetailsWrapperProps {
  proposalId: string;
  onClose: () => void;
  onVote?: (support: number, reason?: string) => void;
}

export default function ProposalDetailsWrapper({ 
  proposalId, 
  onClose, 
  onVote 
}: ProposalDetailsWrapperProps) {
  const { proposal, loading, error } = useProposal(proposalId);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading proposal details...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className={styles.error}>
        <p>Error loading proposal</p>
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <ProposalDetails 
      proposal={proposal} 
      onClose={onClose}
      onVote={onVote}
      defaultSummaryCollapsed={true}
    />
  );
}

