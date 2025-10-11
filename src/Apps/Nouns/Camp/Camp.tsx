/**
 * Nouns Camp
 * View and interact with Nouns governance: proposals, candidates, and voters
 */

'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { NounsApolloWrapper } from '@/app/lib/Nouns/Goldsky';
import { GovernanceActions } from '@/app/lib/Nouns/Contracts';
import Tabs from '@/src/OS/components/UI/Tabs/Tabs';
import ProposalsTab from './components/ProposalsTab/ProposalsTab';
import CandidatesTab from './components/CandidatesTab/CandidatesTab';
import VotersTab from './components/VotersTab/VotersTab';
import styles from './Camp.module.css';

interface CampProps {
  windowId: string;
}

function CampContent({ windowId }: CampProps) {
  const { writeContractAsync } = useWriteContract();
  const [isVoting, setIsVoting] = useState(false);

  // Handle voting on proposals
  const handleVote = async (proposalId: string, support: number, reason?: string) => {
    try {
      setIsVoting(true);
      
      const voteConfig = reason
        ? GovernanceActions.castRefundableVote(BigInt(proposalId), support, reason)
        : GovernanceActions.castRefundableVote(BigInt(proposalId), support);
      
      // Type assertion needed due to wagmi's complex union types for different function overloads
      await writeContractAsync(voteConfig as any);
      
      // Success feedback could be added here
      console.log('Vote cast successfully');
    } catch (error) {
      console.error('Error casting vote:', error);
      // Error feedback could be added here
    } finally {
      setIsVoting(false);
    }
  };

  const tabs = [
    {
      id: 'proposals',
      label: 'Proposals',
      content: <ProposalsTab onVote={handleVote} />,
    },
    {
      id: 'candidates',
      label: 'Candidates',
      content: <CandidatesTab />,
    },
    {
      id: 'voters',
      label: 'Voters',
      content: <VotersTab />,
    },
  ];

  return (
    <div className={styles.camp}>
      <Tabs tabs={tabs} />
    </div>
  );
}

export default function Camp(props: CampProps) {
  // Wrap in Apollo provider for GraphQL queries
  return (
    <NounsApolloWrapper>
      <CampContent {...props} />
    </NounsApolloWrapper>
  );
}

