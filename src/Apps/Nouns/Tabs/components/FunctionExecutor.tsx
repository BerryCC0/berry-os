/**
 * Function Executor - Direct hook integration for Tabs testing
 * Focus on WRITE functions using our new hooks
 * Read functions coming soon (will use useReadContract)
 */

'use client';

import { useState } from 'react';
import {
  useTokenActions,
  useAuctionActions,
  useGovernanceActions,
  useDataProxyActions,
  useRewardsActions,
} from '../../../../../app/lib/Nouns/Contracts';
import { Address } from 'viem';
import styles from './FunctionExecutor.module.css';

interface FunctionExecutorProps {
  contractName: string;
  contractAddress: string;
  functionName: string;
  functionType: 'read' | 'write';
  onClose: () => void;
}

export default function FunctionExecutor({
  contractName,
  contractAddress,
  functionName,
  functionType,
  onClose
}: FunctionExecutorProps) {
  const mainName = contractName.split('[')[0].trim();
  
  // Get all hooks
  const token = useTokenActions();
  const auction = useAuctionActions();
  const governance = useGovernanceActions();
  const dataProxy = useDataProxyActions();
  const rewards = useRewardsActions();
  
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Aggregate transaction status
  const isPending = token.isPending || auction.isPending || governance.isPending || dataProxy.isPending || rewards.isPending;
  const isConfirming = token.isConfirming || auction.isConfirming || governance.isConfirming || dataProxy.isConfirming || rewards.isConfirming;
  const isConfirmed = token.isConfirmed || auction.isConfirmed || governance.isConfirmed || dataProxy.isConfirmed || rewards.isConfirmed;
  const hash = token.hash || auction.hash || governance.hash || dataProxy.hash || rewards.hash;
  
  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExecute = async () => {
    setError(null);
    setResult(null);
    
    try {
      // ============================================
      // NOUNS TOKEN (Write Functions Only)
      // ============================================
      if (mainName === 'Nouns Token') {
        if (functionName === 'Delegate votes') {
          await token.delegate(inputs.delegatee as Address);
          setResult('✅ Delegation transaction submitted!');
        }
        else if (functionName === 'Transfer token') {
          // transferFrom requires 'from' address (msg.sender implied in UI, but required by function)
          const from = inputs.from as Address;
          await token.transferFrom(from, inputs.to as Address, BigInt(inputs.tokenId));
          setResult('✅ Transfer transaction submitted!');
        }
        else if (functionName === 'Safe transfer') {
          await token.safeTransferFrom(
            inputs.from as Address,
            inputs.to as Address,
            BigInt(inputs.tokenId)
          );
          setResult('✅ Safe transfer transaction submitted!');
        }
        else if (functionName === 'Approve') {
          await token.approve(inputs.to as Address, BigInt(inputs.tokenId));
          setResult('✅ Approval transaction submitted!');
        }
        else if (functionName === 'Set approval for all') {
          await token.setApprovalForAll(inputs.operator as Address, inputs.approved === 'true');
          setResult('✅ Approval for all transaction submitted!');
        }
        else if (functionType === 'read') {
          setResult('📖 Read function - coming soon (will use useReadContract)');
        }
      }
      
      // ============================================
      // AUCTION HOUSE (Write Functions Only)
      // ============================================
      else if (mainName === 'Auction House' || mainName === 'Auction House Proxy') {
        if (functionName === 'Create bid with Berry OS') {
          await auction.createBid(BigInt(inputs.nounId), inputs.bidAmountETH);
          setResult('✅ Bid transaction submitted with Berry OS Client ID 11!');
        }
        else if (functionName === 'Settle auction') {
          await auction.settleAuction();
          setResult('✅ Settlement transaction submitted!');
        }
        else if (functionName === 'Settle current & create new') {
          await auction.settleCurrentAndCreateNewAuction();
          setResult('✅ Settle & create transaction submitted!');
        }
        else if (functionType === 'read') {
          // Show current data from hook
          setResult({
            currentAuction: auction.currentAuction,
            duration: auction.auctionDuration?.toString(),
            reservePrice: auction.minReservePrice?.toString(),
            minBidIncrement: auction.minBidIncrement?.toString(),
          });
        }
      }
      
      // ============================================
      // DAO GOVERNOR (Governance Functions)
      // ============================================
      else if (mainName === 'DAO Governor') {
        // VOTING
        if (functionName === 'Cast vote with Berry OS') {
          await governance.voteFor(BigInt(inputs.proposalId), inputs.reason);
          setResult('✅ Vote FOR submitted with Berry OS Client ID 11!');
        }
        else if (functionName === 'Cast vote with reason (Berry OS)') {
          const support = Number(inputs.support); // 0=Against, 1=For, 2=Abstain
          if (support === 0) {
            await governance.voteAgainst(BigInt(inputs.proposalId), inputs.reason);
          } else if (support === 1) {
            await governance.voteFor(BigInt(inputs.proposalId), inputs.reason);
          } else if (support === 2) {
            await governance.voteAbstain(BigInt(inputs.proposalId), inputs.reason);
          }
          setResult('✅ Vote submitted with Berry OS Client ID 11!');
        }
        // PROPOSAL CREATION
        else if (functionName === 'Create proposal') {
          await governance.propose(
            inputs.targets?.split(',').map(t => t.trim() as Address) || [],
            inputs.values?.split(',').map(v => BigInt(v.trim())) || [],
            inputs.signatures?.split(',').map(s => s.trim()) || [],
            inputs.calldatas?.split(',').map(c => c.trim() as `0x${string}`) || [],
            inputs.description
          );
          setResult('✅ Proposal created with Berry OS Client ID 11!');
        }
        else if (functionName === 'Propose by signatures') {
          // Parse proposer signatures from JSON input
          const sigs = JSON.parse(inputs.proposerSignatures || '[]');
          await governance.proposeBySigs(
            sigs,
            inputs.targets?.split(',').map(t => t.trim() as Address) || [],
            inputs.values?.split(',').map(v => BigInt(v.trim())) || [],
            inputs.signatures?.split(',').map(s => s.trim()) || [],
            inputs.calldatas?.split(',').map(c => c.trim() as `0x${string}`) || [],
            inputs.description
          );
          setResult('✅ Multi-signer proposal created with Berry OS Client ID 11!');
        }
        // PROPOSAL LIFECYCLE
        else if (functionName === 'Queue proposal') {
          await governance.queue(BigInt(inputs.proposalId));
          setResult('✅ Proposal queued!');
        }
        else if (functionName === 'Execute proposal') {
          await governance.execute(BigInt(inputs.proposalId));
          setResult('✅ Proposal executed!');
        }
        else if (functionName === 'Cancel proposal') {
          await governance.cancel(BigInt(inputs.proposalId));
          setResult('✅ Proposal cancelled!');
        }
        else if (functionName === 'Veto proposal') {
          await governance.veto(BigInt(inputs.proposalId));
          setResult('✅ Proposal vetoed!');
        }
        // PROPOSAL UPDATES
        else if (functionName === 'Update proposal') {
          await governance.updateProposal(
            BigInt(inputs.proposalId),
            inputs.targets?.split(',').map(t => t.trim() as Address) || [],
            inputs.values?.split(',').map(v => BigInt(v.trim())) || [],
            inputs.signatures?.split(',').map(s => s.trim()) || [],
            inputs.calldatas?.split(',').map(c => c.trim() as `0x${string}`) || [],
            inputs.description,
            inputs.updateMessage
          );
          setResult('✅ Proposal updated!');
        }
        // FORK OPERATIONS (Coming soon - separate hook)
        else if (functionName === 'Escrow to fork' || functionName === 'Execute fork' || 
                 functionName === 'Join fork' || functionName === 'Withdraw from fork') {
          setResult('🔜 Fork functions coming soon (separate hook)');
        }
        else if (functionType === 'read') {
          // Show current data from hook
          setResult({
            proposalThreshold: governance.proposalThreshold?.toString(),
            votingDelay: governance.votingDelay?.toString(),
            votingPeriod: governance.votingPeriod?.toString(),
            proposalCount: governance.proposalCount?.toString(),
          });
        }
      }
      
      // ============================================
      // DATA PROXY (Write Functions Only)
      // ============================================
      else if (mainName === 'Data Proxy') {
        if (functionName === 'Create proposal candidate') {
          await dataProxy.createProposalCandidate(
            inputs.targets?.split(',').map(t => t.trim() as Address) || [],
            inputs.values?.split(',').map(v => BigInt(v.trim())) || [],
            inputs.signatures?.split(',').map(s => s.trim()) || [],
            inputs.calldatas?.split(',').map(c => c.trim() as `0x${string}`) || [],
            inputs.description,
            inputs.slug,
            BigInt(inputs.proposalIdToUpdate || '0')
          );
          setResult('✅ Proposal candidate created!');
        }
        else if (functionName === 'Update proposal candidate') {
          await dataProxy.updateProposalCandidate(
            inputs.targets?.split(',').map(t => t.trim() as Address) || [],
            inputs.values?.split(',').map(v => BigInt(v.trim())) || [],
            inputs.signatures?.split(',').map(s => s.trim()) || [],
            inputs.calldatas?.split(',').map(c => c.trim() as `0x${string}`) || [],
            inputs.description,
            inputs.slug,
            BigInt(inputs.proposalIdToUpdate),
            inputs.reason || ''
          );
          setResult('✅ Proposal candidate updated!');
        }
        else if (functionName === 'Cancel proposal candidate') {
          await dataProxy.cancelProposalCandidate(inputs.slug);
          setResult('✅ Proposal candidate cancelled!');
        }
        else if (functionName === 'Add signature') {
          await dataProxy.addSignature(
            inputs.sig as `0x${string}`,
            BigInt(inputs.expirationTimestamp),
            inputs.proposer as Address,
            inputs.slug,
            BigInt(inputs.proposalIdToUpdate || '0'),
            inputs.encodedProp as `0x${string}`,
            inputs.reason
          );
          setResult('✅ Signature added!');
        }
        else if (functionName === 'Send feedback') {
          await dataProxy.sendFeedback(
            BigInt(inputs.proposalId),
            Number(inputs.support),
            inputs.reason || ''
          );
          setResult('✅ Feedback sent!');
        }
        else if (functionName === 'Send candidate feedback') {
          await dataProxy.sendCandidateFeedback(
            inputs.proposer as Address,
            inputs.slug,
            Number(inputs.support),
            inputs.reason || ''
          );
          setResult('✅ Candidate feedback sent!');
        }
        else if (functionName === 'Post voter message') {
          await dataProxy.postVoterMessageToDunaAdmin(
            inputs.message,
            inputs.relatedProposals?.split(',').map(p => BigInt(p.trim())) || []
          );
          setResult('✅ Voter message posted!');
        }
        else if (functionName === 'Signal compliance') {
          await dataProxy.signalProposalCompliance(
            BigInt(inputs.proposalId),
            Number(inputs.signal),
            inputs.reason
          );
          setResult('✅ Compliance signaled!');
        }
        else if (functionName === 'Post Duna admin message') {
          await dataProxy.postDunaAdminMessage(
            inputs.message,
            inputs.relatedProposals?.split(',').map(p => BigInt(p.trim())) || []
          );
          setResult('✅ Admin message posted!');
        }
        else if (functionType === 'read') {
          // Show current data from hook
          setResult({
            createCost: dataProxy.createCandidateCost?.toString(),
            updateCost: dataProxy.updateCandidateCost?.toString(),
          });
        }
      }
      
      // ============================================
      // CLIENT REWARDS (Write Functions Only)
      // ============================================
      else if (mainName === 'Client Rewards' || mainName === 'Client Rewards Proxy') {
        if (functionName === 'Register client') {
          await rewards.registerClient(inputs.name, inputs.description);
          setResult('✅ Client registered!');
        }
        else if (functionName === 'Withdraw client rewards') {
          await rewards.withdrawClientBalance(Number(inputs.clientId), inputs.to as Address);
          setResult('✅ Rewards withdrawn!');
        }
        else if (functionName === 'Withdraw Berry OS rewards') {
          await rewards.withdrawBerryOSRewards(inputs.to as Address);
          setResult('✅ Berry OS rewards withdrawn!');
        }
        else if (functionName === 'Update proposal rewards') {
          await rewards.updateRewardsForProposalWritingAndVoting(
            BigInt(inputs.lastProposalId),
            inputs.votingClientIds?.split(',').map(id => Number(id.trim())) || []
          );
          setResult('✅ Proposal rewards updated!');
        }
        else if (functionName === 'Update auction rewards') {
          await rewards.updateRewardsForAuctions(BigInt(inputs.lastNounId));
          setResult('✅ Auction rewards updated!');
        }
        else if (functionType === 'read') {
          // Show current data from hook
          setResult({
            berryOSBalance: rewards.berryOSBalance?.toString(),
            berryOSClient: rewards.berryOSClient,
            nextAuctionIdToReward: rewards.nextAuctionIdToReward?.toString(),
            nextProposalIdToReward: rewards.nextProposalIdToReward?.toString(),
          });
        }
      }
      
      // Fallback
      else {
        if (functionType === 'read') {
          setResult('📖 Read function - coming soon (will use useReadContract)');
        } else {
          setResult(`❌ Function "${functionName}" not yet implemented for ${mainName}`);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    }
  };
  
  // Get required inputs for this function
  const getRequiredInputs = () => {
    // Token
    if (functionName === 'Delegate votes') return ['delegatee'];
    if (functionName === 'Transfer token') return ['from', 'to', 'tokenId'];
    if (functionName === 'Safe transfer') return ['from', 'to', 'tokenId'];
    if (functionName === 'Approve') return ['to', 'tokenId'];
    if (functionName === 'Set approval for all') return ['operator', 'approved'];
    
    // Auction
    if (functionName === 'Create bid with Berry OS') return ['nounId', 'bidAmountETH'];
    
    // Governance
    if (functionName === 'Cast vote with Berry OS') return ['proposalId', 'reason'];
    if (functionName === 'Cast vote with reason (Berry OS)') return ['proposalId', 'support', 'reason'];
    if (functionName === 'Create proposal') return ['targets', 'values', 'signatures', 'calldatas', 'description'];
    if (functionName === 'Propose by signatures') return ['proposerSignatures', 'targets', 'values', 'signatures', 'calldatas', 'description'];
    if (functionName === 'Queue proposal') return ['proposalId'];
    if (functionName === 'Execute proposal') return ['proposalId'];
    if (functionName === 'Cancel proposal') return ['proposalId'];
    if (functionName === 'Veto proposal') return ['proposalId'];
    if (functionName === 'Update proposal') return ['proposalId', 'targets', 'values', 'signatures', 'calldatas', 'description', 'updateMessage'];
    
    // Data Proxy
    if (functionName === 'Create proposal candidate') return ['targets', 'values', 'signatures', 'calldatas', 'description', 'slug', 'proposalIdToUpdate'];
    if (functionName === 'Update proposal candidate') return ['targets', 'values', 'signatures', 'calldatas', 'description', 'slug', 'proposalIdToUpdate', 'reason'];
    if (functionName === 'Cancel proposal candidate') return ['slug'];
    if (functionName === 'Add signature') return ['sig', 'expirationTimestamp', 'proposer', 'slug', 'proposalIdToUpdate', 'encodedProp', 'reason'];
    if (functionName === 'Send feedback') return ['proposalId', 'support', 'reason'];
    if (functionName === 'Send candidate feedback') return ['proposer', 'slug', 'support', 'reason'];
    if (functionName === 'Post voter message') return ['message', 'relatedProposals'];
    if (functionName === 'Signal compliance') return ['proposalId', 'signal', 'reason'];
    if (functionName === 'Post Duna admin message') return ['message', 'relatedProposals'];
    
    // Rewards
    if (functionName === 'Register client') return ['name', 'description'];
    if (functionName === 'Withdraw client rewards') return ['clientId', 'to'];
    if (functionName === 'Withdraw Berry OS rewards') return ['to'];
    if (functionName === 'Update proposal rewards') return ['lastProposalId', 'votingClientIds'];
    if (functionName === 'Update auction rewards') return ['lastNounId'];
    
    return [];
  };
  
  const requiredInputs = getRequiredInputs();
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.icon}>{functionType === 'read' ? '📖' : '✍️'}</span>
            <span>{functionName}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.body}>
          <p className={styles.contract}>
            <strong>{mainName}</strong>
          </p>
          <p className={styles.address}>
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </p>
          
          {/* Input forms */}
          {requiredInputs.length > 0 && (
            <div className={styles.inputs}>
              {requiredInputs.map(inputName => (
                <div key={inputName} className={styles.inputGroup}>
                  <label>{inputName}</label>
                  <input
                    type="text"
                    value={inputs[inputName] || ''}
                    onChange={(e) => handleInputChange(inputName, e.target.value)}
                    placeholder={`Enter ${inputName}`}
                    className={styles.input}
                  />
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div className={styles.error}>
              ❌ {error}
            </div>
          )}
          
          {result && (
            <div className={styles.result}>
              <h4>Result:</h4>
              <pre>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
          
          {isConfirming && (
            <div className={styles.loading}>
              ⏳ Waiting for confirmation...
            </div>
          )}
          
          {isConfirmed && hash && (
            <div className={styles.success}>
              ✅ Transaction confirmed!
              <a
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on Etherscan ↗
              </a>
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.executeButton}
            onClick={handleExecute}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? 'Processing...' : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}
