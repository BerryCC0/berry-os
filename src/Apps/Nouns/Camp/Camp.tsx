/**
 * Nouns Camp
 * View and interact with Nouns governance: proposals, candidates, and voters
 */

'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { NounsApolloWrapper } from '@/app/lib/Nouns/Goldsky';
import { GovernanceActions } from '@/app/lib/Nouns/Contracts';
import Tabs from '@/src/OS/components/UI/Tabs/Tabs';
import ActivityTab from './components/ActivityTab/ActivityTab';
import ProposalsTab from './components/ProposalsTab/ProposalsTab';
import CandidatesTab from './components/CandidatesTab/CandidatesTab';
import VotersTab from './components/VotersTab/VotersTab';
import AccountTab from './components/AccountTab/AccountTab';
import CreateProposalTab from './components/CreateProposalTab/CreateProposalTab';
import { useENS } from './utils/hooks/useENS';
import { eventBus } from '@/src/OS/lib/eventBus';
import styles from './Camp.module.css';

interface CampProps {
  windowId: string;
}

function CampContent({ windowId }: CampProps) {
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const { ensName, ensAvatar } = useENS(address);
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

  const [activeTab, setActiveTab] = useState('activity');
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Handle menu actions
  useEffect(() => {
    const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
      const { action } = payload as any;
      
      switch (action) {
        case 'camp:create-proposal':
          setActiveTab('create');
          break;
        case 'camp:new-proposal':
          setActiveTab('create');
          // Trigger new proposal action
          eventBus.publish('CAMP_NEW_PROPOSAL', {});
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle edit proposal navigation
  const handleEditProposal = (proposalId: string) => {
    setEditingProposalId(proposalId);
    setActiveTab('create');
  };

  const tabs = [
    {
      id: 'activity',
      label: 'Activity',
      content: <ActivityTab onVote={handleVote} />,
    },
    {
      id: 'proposals',
      label: 'Proposals',
      content: <ProposalsTab onVote={handleVote} onEditProposal={handleEditProposal} />,
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

  // Create tab (pinned, only visible when wallet connected)
  const createTab = isConnected ? {
    id: 'create',
    label: editingProposalId ? 'Edit' : 'Create',
    content: (
      <CreateProposalTab 
        editProposalId={editingProposalId || undefined}
        onBack={() => {
          setEditingProposalId(null);
          setActiveTab('proposals');
        }}
      />
    ),
  } : null;

  // Account tab (pinned to the right)
  const accountTab = {
    id: 'account',
    label: isConnected && ensName ? ensName : 'Account',
    content: <AccountTab />,
    renderLabel: () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isConnected && ensAvatar && (
          <img 
            src={ensAvatar} 
            alt="Account" 
            style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '3px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className={styles.accountLabel}>
          {isConnected && ensName ? ensName : 'Account'}
        </span>
      </div>
    ),
  };

  // Build pinned tabs array - Create tab comes before Account tab
  const pinnedTabs = createTab ? [createTab, accountTab] : [accountTab];

  return (
    <div className={styles.camp}>
      <Tabs 
        tabs={tabs}
        pinnedTabs={pinnedTabs}
        wrapContentInScrollBar={true}
        activeTab={activeTab}
        onChange={setActiveTab}
        leftContent={
          <img 
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAA/FBMVEX/////wRD+YwwUZjb/vQD/0IL/wiv+loL+aSn+TQAAUQAAZjgtbEOCl4b/wiX/xhD+YAz19fX/+vUASgD+Zwz/YwP/xlz/ow7+WwxceWItZjX+VQz+kg4lZjbjZBv+fw2CZTD/58xVZjT/8eIAXRfM0M3IZCPi5OKHl4ryYxIPXC3/04KtZSr/sQ+rta3/26tyi3dwl4bAl4T/xYL/y3IAHwAAWQOkTwD/tgA7ck0/bEIAbEWtazr/syv/xDk+ZjWiZSzSZCFAaEkAPQAAYin+dw2hrKNqZTP/2aQAFQAlYThdbELzaiz+XSn+lioAQwA5UQD+NgD+kIL+sILGSCDSAAACq0lEQVR4nO3aC0PSUBiAYYcb5SZzylQEp2kgkIJWRppFlJfsfvv//6Wdg+kuZ17IsWnv8wu+F87gY2xiAgAAAAAAAAAAAAAAAAAAAAAAABiHxk4p4umzB0mebxqGsbuW9cwh3Rc9M+LlVJKOpuv63nbWM4d0zf3pkFcHrx8meWMXi309ZwHl6cmQqrU1X1BzOjOaVsxzgFetem+VAa5QyH2AJQ3iAU5NyldAQ2r1vIv5B1u+wbtYgOMuS3uaptm6sSbNZTz/7PtDs1wu1wPH31qZl2JvQGV1RtIkXdjrZx6wdCQ+dCbDAeqrt7KqBdm2XdQWsg+oRz5/rh0gDxIBBBBAAAH3KcDzvKqnDBBbnJPHgIlgwHCLUwVUxBI3dawIyG7y5knXd7J/dP7yWx82pHZ8/uVFoRMN0LT+6bbv9HEGAY2PvbJZNi/OT9V6lLDFubXF4BoXMtzpsviB3DCnw2ucH6C+eGWArhheniKx0+mZBMR/RV4WkDD/2aVAAAEEEEDAJQGFux5wp98Bx3EqTs4CuqWWb+d8i/PXuK0VKT6+25GSFom/dg1hXHcbS4d10zQDN+M8a2O+oFzjHFdL2uJChiudMaaAVl1scV4kQMlxr3rtzw6Rr6+PLcCMnP5/D5ARBBBAAAH/Y4Anbmbd5YDhvSxFgCNUchYwK7V6FwHeulBVBMj/hN3jGwXMSenN31ySAuNb6yttwY2NX1seLjjXnt9XXJDSu03XNOtCcA1db6tPvx9w5QYXJ5P1FAM+RW7GiQD11TtagC2lGPAk/PF56wFDBBBAAAE3CbjN7wEp/e+BgIPPXxKe7Pv6zS6OKMWA79FnK80ftYRnK3+erRIjSDEg+nRrqdRKerr11+9NY0RZ/GUJAAAAAAAAAAAAAAAAAAAAAACA++sP89Z/fummxOwAAAAASUVORK5CYII="
            alt="Camp Logo"
            className={styles.logo}
          />
        }
      />
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

