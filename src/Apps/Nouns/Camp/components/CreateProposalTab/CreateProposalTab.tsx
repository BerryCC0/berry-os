/**
 * CreateProposalTab Component
 * Main proposal creation interface for Camp
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { GovernanceActions, DataProxyActions } from '@/app/lib/Nouns/Contracts';
import { ProposalDraft, ProposalAction } from '@/app/lib/Persistence/proposalDrafts';
import { PersonaKYC } from './components/PersonaKYC';
import { ActionTemplateEditor } from './components/ActionTemplateEditor';
import { MarkdownEditor } from './components/MarkdownEditor';
import { DraftSelector } from './components/DraftSelector';
import { eventBus } from '@/src/OS/lib/eventBus';
import { NOUNS_CONTRACTS, EXTERNAL_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';
import { DataProxyABI } from '@/app/lib/Nouns/Contracts/abis';
import { useNounHolderStatus } from '../../utils/hooks/useNounHolderStatus';
import { generateSlugFromTitle, makeSlugUnique } from '../../utils/slugGenerator';
import styles from './CreateProposalTab.module.css';

interface CreateProposalTabProps {
  onBack?: () => void;
}

type ProposalState = 'idle' | 'confirming' | 'pending' | 'error' | 'success';

// Helper to get contract label from address
function getContractLabel(address: string): string {
  const lowerAddress = address.toLowerCase();
  
  if (lowerAddress === NOUNS_CONTRACTS.NounsToken.address.toLowerCase()) {
    return 'Nouns Token';
  }
  if (lowerAddress === NOUNS_CONTRACTS.NounsTreasury.proxy.toLowerCase()) {
    return 'Nouns DAO Treasury';
  }
  if (lowerAddress === EXTERNAL_CONTRACTS.WETH.address.toLowerCase()) {
    return 'WETH Token';
  }
  if (lowerAddress === EXTERNAL_CONTRACTS.USDC.address.toLowerCase()) {
    return 'USDC Token';
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to decode calldata into human-readable parameters
function decodeCalldata(signature: string, calldata: string): Array<{ name: string; value: string }> {
  if (!signature || !calldata || calldata === '0x') {
    return [];
  }
  
  try {
    // Remove function selector (first 10 characters: '0x' + 8 hex chars)
    const params = calldata.slice(10);
    
    // Parse function signature to get parameter types
    const match = signature.match(/\(([^)]*)\)/);
    if (!match) return [];
    
    const paramTypes = match[1].split(',').map(t => t.trim());
    const decodedParams: Array<{ name: string; value: string }> = [];
    
    // Each parameter is 64 hex characters (32 bytes)
    for (let i = 0; i < paramTypes.length; i++) {
      const paramType = paramTypes[i];
      const paramData = params.slice(i * 64, (i + 1) * 64);
      
      if (paramType.startsWith('address')) {
        // Address: last 40 hex characters (20 bytes)
        const address = '0x' + paramData.slice(24);
        const label = getAddressLabel(address);
        // Only show full address if it's a known label, otherwise truncate
        const displayValue = label.includes('...') ? label : `${address.slice(0, 6)}...${address.slice(-4)}`;
        decodedParams.push({
          name: label,
          value: displayValue
        });
      } else if (paramType.startsWith('uint') || paramType.startsWith('int')) {
        // Integer: convert hex to decimal
        const value = BigInt('0x' + paramData);
        decodedParams.push({
          name: formatAmount(value, paramType),
          value: value.toString()
        });
      } else {
        // Fallback for other types
        decodedParams.push({
          name: paramType,
          value: '0x' + paramData
        });
      }
    }
    
    return decodedParams;
  } catch (error) {
    console.error('Error decoding calldata:', error);
    return [];
  }
}

// Helper to get address label
function getAddressLabel(address: string): string {
  const lowerAddress = address.toLowerCase();
  
  if (lowerAddress === NOUNS_CONTRACTS.NounsTreasury.proxy.toLowerCase()) {
    return 'Nouns DAO Treasury';
  }
  if (lowerAddress === EXTERNAL_CONTRACTS.WETH.address.toLowerCase()) {
    return 'WETH Token';
  }
  if (lowerAddress === EXTERNAL_CONTRACTS.USDC.address.toLowerCase()) {
    return 'USDC Token';
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format amounts based on context
function formatAmount(value: bigint, type: string): string {
  // Check if it's a reasonable token ID (< 10000)
  if (value < BigInt(10000)) {
    return `Noun ${value}`;
  }
  
  // Otherwise it's likely a token amount
  // WETH/ETH: 18 decimals
  if (value > BigInt(1000000000000000)) { // > 0.001 ETH
    const eth = Number(value) / 1e18;
    return `${eth.toFixed(6)} ETH/WETH`;
  }
  
  // USDC: 6 decimals
  if (value > BigInt(1000000)) { // > 1 USDC
    const usdc = Number(value) / 1e6;
    return `${usdc.toFixed(2)} USDC`;
  }
  
  return value.toString();
}

export default function CreateProposalTab({ onBack }: CreateProposalTabProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Form state
  const [draftName, setDraftName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: '', value: '0', signature: '', calldata: '0x' }
  ]);
  const [proposalType, setProposalType] = useState<'standard' | 'timelock_v1' | 'candidate'>('standard');
  
  // UI state
  const [proposalState, setProposalState] = useState<ProposalState>('idle');
  const [timelockV1State, setTimelockV1State] = useState<ProposalState>('idle');
  const [candidateState, setCandidateState] = useState<ProposalState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycInquiryId, setKycInquiryId] = useState<string | undefined>();
  
  // Check if user has voting power (Noun holder or delegate)
  const { hasVotingPower, votes } = useNounHolderStatus();
  
  // Read candidate creation cost from Data Proxy
  const { data: candidateCost } = useReadContract({
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as `0x${string}`,
    abi: DataProxyABI,
    functionName: 'createCandidateCost',
  });
  const [expandedPreviews, setExpandedPreviews] = useState<{ [key: number]: boolean }>({});
  
  // Draft management
  const [drafts, setDrafts] = useState<ProposalDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load drafts on mount and select the most recent one
  useEffect(() => {
    if (address) {
      loadUserDrafts();
    }
  }, [address]);

  // Auto-load most recent draft when drafts are loaded
  useEffect(() => {
    if (drafts.length > 0 && !draftName && address) {
      // Load the most recent draft (first in list, sorted by updated_at DESC)
      const mostRecent = drafts[0];
      handleLoadDraft(mostRecent);
    }
  }, [drafts.length, address]);

  // Auto-save draft as user types (debounced)
  useEffect(() => {
    if (!address || !title.trim()) {
      // Don't auto-save if no wallet connected or no title
      return;
    }

    // Generate draft name from title (slugified)
    const generatedDraftName = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    if (!generatedDraftName) return;

    // Debounce auto-save by 2 seconds
    const timeoutId = setTimeout(() => {
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_name: generatedDraftName,
        title,
        description,
        actions,
        proposal_type: proposalType,
        kyc_verified: kycVerified,
        kyc_inquiry_id: kycInquiryId,
      };

      // Auto-save silently in background
      fetch('/api/proposals/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
        .then(() => {
          // Update draft name if it changed
          if (draftName !== generatedDraftName) {
            setDraftName(generatedDraftName);
          }
          // Reload drafts list to show updated timestamp
          loadUserDrafts();
        })
        .catch(err => {
          console.error('Auto-save failed:', err);
        });
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [title, description, actions, proposalType, kycVerified, kycInquiryId, address]);

  // Listen for menu actions
  useEffect(() => {
    const newSub = eventBus.subscribe('CAMP_NEW_PROPOSAL', () => {
      handleNewDraft();
    });

    return () => {
      newSub.unsubscribe();
    };
  }, []);

  const loadUserDrafts = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/proposals/drafts/load?wallet=${address}`);
      const data = await response.json();
      
      if (data.success && data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet to save drafts');
      return;
    }

    if (!draftName.trim()) {
      setErrorMessage('Please enter a draft name');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_name: draftName.trim(),
        title,
        description,
        actions,
        proposal_type: proposalType,
        kyc_verified: kycVerified,
        kyc_inquiry_id: kycInquiryId,
      };

      const response = await fetch('/api/proposals/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const data = await response.json();

      if (data.success) {
        await loadUserDrafts();
        setErrorMessage(null);
        // Show success message briefly
        const successMsg = errorMessage;
        setErrorMessage('Draft saved successfully!');
        setTimeout(() => {
          if (errorMessage === 'Draft saved successfully!') {
            setErrorMessage(successMsg);
          }
        }, 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrorMessage('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = (draft: ProposalDraft) => {
    setDraftName(draft.draft_name);
    setTitle(draft.title);
    setDescription(draft.description);
    setActions(draft.actions.length > 0 ? draft.actions : [{ target: '', value: '0', signature: '', calldata: '0x' }]);
    setProposalType(draft.proposal_type);
    setKycVerified(draft.kyc_verified);
    setKycInquiryId(draft.kyc_inquiry_id);
    setErrorMessage(null);
  };

  const handleDeleteDraft = async (draftNameToDelete: string) => {
    if (!address) return;

    try {
      const response = await fetch(`/api/proposals/drafts/delete?wallet=${address}&name=${encodeURIComponent(draftNameToDelete)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadUserDrafts();
        
        // Clear form if deleting current draft
        if (draftName === draftNameToDelete) {
          handleNewDraft();
        }
      } else {
        setErrorMessage(data.error || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      setErrorMessage('Failed to delete draft');
    }
  };

  const handleNewDraft = () => {
    // Don't clear draftName - it will be auto-generated from title
    setTitle('');
    setDescription('');
    setActions([{ target: '', value: '0', signature: '', calldata: '0x' }]);
    setProposalType('standard');
    setKycVerified(false);
    setKycInquiryId(undefined);
    setErrorMessage(null);
    setProposalState('idle');
    setTimelockV1State('idle');
    setCandidateState('idle');
  };

  const handleKYCComplete = (data: { inquiryId: string; status: string; fields: Record<string, unknown> }) => {
    setKycVerified(true);
    setKycInquiryId(data.inquiryId);
    setErrorMessage(null);
  };

  const handleKYCError = () => {
    setKycVerified(false);
    setErrorMessage('KYC verification failed. Please try again.');
  };

  const addAction = () => {
    setActions([...actions, { target: '', value: '0', signature: '', calldata: '0x' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(prevActions => {
        const action = prevActions[index];
        
        // If removing a multi-action parent, remove entire group
        if (action.isPartOfMultiAction && action.multiActionGroupId) {
          const groupId = action.multiActionGroupId;
          return prevActions.filter(a => a.multiActionGroupId !== groupId);
        }
        
        // Otherwise, remove single action
        return prevActions.filter((_, i) => i !== index);
      });
    }
  };

  const updateAction = React.useCallback((index: number, field: string, value: string) => {
    setActions(prevActions => {
      const updatedActions = [...prevActions];
      updatedActions[index] = { ...updatedActions[index], [field]: value };
      return updatedActions;
    });
  }, []);

  // Ref to prevent double-execution of action generation
  const processingActionsRef = React.useRef(false);
  
  // Handle multi-action templates (e.g., Noun swap)
  const handleActionsGenerated = React.useCallback((index: number, generatedActions: ProposalAction[]) => {
    // Prevent concurrent calls
    if (processingActionsRef.current) {
      console.log('[CreateProposalTab] Already processing, skipping duplicate call');
      return;
    }
    
    console.log('[CreateProposalTab] handleActionsGenerated called:', {
      index,
      generatedCount: generatedActions.length
    });
    
    processingActionsRef.current = true;
    
    setActions(prevActions => {
      if (generatedActions.length === 0) {
        // No actions generated yet - keep the placeholder
        return prevActions;
      } else if (generatedActions.length === 1) {
        // Single action - replace at index
        const updatedActions = [...prevActions];
        updatedActions[index] = generatedActions[0];
        return updatedActions;
      } else {
        // Multiple actions - replace existing multi-action group or insert new one
        const updatedActions = [...prevActions];
        
        // Check if we're replacing an existing multi-action group at this index
        const existingAction = prevActions[index];
        if (existingAction?.isPartOfMultiAction && existingAction.multiActionGroupId) {
          // Find all actions in the existing group
          const existingGroupId = existingAction.multiActionGroupId;
          const groupStartIndex = prevActions.findIndex(a => a.multiActionGroupId === existingGroupId);
          const groupEndIndex = prevActions.findLastIndex(a => a.multiActionGroupId === existingGroupId);
          const groupSize = groupEndIndex - groupStartIndex + 1;
          
          // Replace the entire existing group with the new actions
          updatedActions.splice(groupStartIndex, groupSize, ...generatedActions);
        } else {
          // No existing group - replace single action with multiple
          updatedActions.splice(index, 1, ...generatedActions);
        }
        
        return updatedActions;
      }
    });
    
    // Reset the flag after a brief delay to allow React to finish batching
    setTimeout(() => {
      processingActionsRef.current = false;
    }, 50);
  }, []); // Empty deps - we use functional setState so we don't need actions in deps

  const validateForm = (requireKYC: boolean = true) => {
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return false;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required');
      return false;
    }

    // KYC only required for standard and timelock proposals
    if (requireKYC && !kycVerified && proposalType !== 'candidate') {
      setErrorMessage('Please complete KYC verification before creating a proposal');
      return false;
    }

    // Validate each action
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action.target.trim()) {
        setErrorMessage(`Action ${i + 1}: Target address is required`);
        return false;
      }

      // Basic address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(action.target)) {
        setErrorMessage(`Action ${i + 1}: Invalid target address format`);
        return false;
      }

      // Validate value is a number
      if (isNaN(Number(action.value))) {
        setErrorMessage(`Action ${i + 1}: Value must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitCandidate = async () => {
    if (!validateForm(false)) { // No KYC required for candidates
      return;
    }

    setErrorMessage(null);
    setCandidateState('confirming');

    try {
      // Generate unique slug from title
      const baseSlug = generateSlugFromTitle(title);
      const uniqueSlug = makeSlugUnique(baseSlug);

      // Prepare proposal data
      const targets = actions.map(action => action.target as `0x${string}`);
      const values = actions.map(action => BigInt(action.value));
      const signatures = actions.map(action => action.signature);
      const calldatas = actions.map(action => {
        const data = action.calldata;
        return (data.startsWith('0x') ? data : `0x${data}`) as `0x${string}`;
      });
      const fullDescription = `# ${title}\n\n${description}`;

      // Create candidate config
      const config = DataProxyActions.createProposalCandidate(
        targets,
        values,
        signatures,
        calldatas,
        fullDescription,
        uniqueSlug,
        BigInt(0) // proposalIdToUpdate - 0 for new proposal
      );

      // Add value if fee is required
      const txConfig = {
        ...config,
        value: !hasVotingPower && candidateCost ? candidateCost : undefined,
      };

      setCandidateState('pending');
      await writeContractAsync(txConfig as any);

      setCandidateState('success');
      setErrorMessage(null);

      // Clear form on success
      setTimeout(() => {
        handleNewDraft();
      }, 3000);
    } catch (err: unknown) {
      setCandidateState('error');

      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setErrorMessage('Transaction was rejected');
        } else if (err.message.includes('insufficient funds')) {
          setErrorMessage('Insufficient funds for transaction');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to create candidate');
      }
    }
  };

  const handleSubmitProposal = async (isTimelockV1: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setErrorMessage(null);
    const setState = isTimelockV1 ? setTimelockV1State : setProposalState;
    setState('confirming');

    try {
      // Prepare proposal data
      const targets = actions.map(action => action.target as `0x${string}`);
      const values = actions.map(action => BigInt(action.value));
      const signatures = actions.map(action => action.signature);
      const calldatas = actions.map(action => {
        const data = action.calldata;
        return (data.startsWith('0x') ? data : `0x${data}`) as `0x${string}`;
      });
      const fullDescription = `# ${title}\n\n${description}`;

      // Create proposal config
      const config = isTimelockV1
        ? GovernanceActions.proposeOnTimelockV1(targets, values, signatures, calldatas, fullDescription)
        : GovernanceActions.propose(targets, values, signatures, calldatas, fullDescription);

      setState('pending');
      await writeContractAsync(config as any);

      setState('success');
      setErrorMessage(null);

      // Clear form on success
      setTimeout(() => {
        handleNewDraft();
      }, 3000);
    } catch (err: unknown) {
      setState('error');

      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setErrorMessage('Transaction was rejected');
        } else if (err.message.includes('insufficient funds')) {
          setErrorMessage('Insufficient funds for transaction');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to create proposal. Please try again.');
      }
    }
  };

  const isCreating = isPending || proposalState === 'pending' || timelockV1State === 'pending' || candidateState === 'pending';

  return (
    <div className={styles.container}>
      {onBack && (
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Create Proposal</h2>
      </div>

      {!isConnected && (
        <div className={styles.warning}>
          Please connect your wallet to create a proposal.
        </div>
      )}

      <div className={styles.form}>
        {/* Draft Management */}
        <DraftSelector
          drafts={drafts}
          onLoad={handleLoadDraft}
          onDelete={handleDeleteDraft}
          onNew={handleNewDraft}
          disabled={isCreating}
          currentDraftName={draftName}
        />

        {/* Proposal Type */}
        <div className={styles.section}>
          <label className={styles.label}>Proposal Type *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="standard"
                checked={proposalType === 'standard'}
                onChange={(e) => setProposalType(e.target.value as 'standard')}
                disabled={isCreating}
              />
              <span>Standard Proposal</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="candidate"
                checked={proposalType === 'candidate'}
                onChange={(e) => setProposalType(e.target.value as 'candidate')}
                disabled={isCreating}
              />
              <span>Candidate (Draft)</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="timelock_v1"
                checked={proposalType === 'timelock_v1'}
                onChange={(e) => setProposalType(e.target.value as 'timelock_v1')}
                disabled={isCreating}
              />
              <span>TimelockV1 Proposal</span>
            </label>
          </div>
          
          {proposalType === 'candidate' && (
            <div className={styles.helpText}>
              Candidates are draft proposals that can gather community support before formal submission.
              {!hasVotingPower && candidateCost && (
                <span className={styles.feeNotice}>
                  {' '}Fee: {(Number(candidateCost) / 1e18).toFixed(4)} ETH (waived for Noun holders/delegates)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className={styles.section}>
          <label className={styles.label}>Proposal Title *</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title for your proposal"
            disabled={isCreating}
            maxLength={200}
          />
        </div>

        {/* Two Column Layout */}
        <div className={styles.twoColumnLayout}>
          {/* Left Column: Description */}
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <label className={styles.label}>Description *</label>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                disabled={isCreating}
                rows={10}
              />
            </div>
          </div>

          {/* Right Column: Actions + KYC */}
          <div className={styles.rightColumn}>
            {/* Actions */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <label className={styles.label}>Actions</label>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addAction}
                  disabled={isCreating}
                >
                  + Add Action
                </button>
              </div>

              {actions.map((action, index) => {
                // Skip rendering child actions separately - they'll be shown in the parent
                if (action.isPartOfMultiAction && action.multiActionIndex! > 0) {
                  return null;
                }
                
                // Get all actions in this group if it's a multi-action
                const groupActions = action.isPartOfMultiAction && action.multiActionGroupId
                  ? actions.filter(a => a.multiActionGroupId === action.multiActionGroupId)
                  : [action];
                
                return (
                  <div key={index} className={styles.actionContainer}>
                    {actions.length > 1 && !action.isPartOfMultiAction && (
                      <button
                        type="button"
                        className={styles.removeActionButton}
                        onClick={() => removeAction(index)}
                        disabled={isCreating}
                        title="Remove this action"
                      >
                        ×
                      </button>
                    )}
                    
                    {/* Render full ActionTemplateEditor */}
                    <ActionTemplateEditor
                      index={index}
                      action={action}
                      onUpdate={(field, value) => updateAction(index, field, value)}
                      onActionsGenerated={(generatedActions) => handleActionsGenerated(index, generatedActions)}
                      disabled={isCreating}
                    />
                    
                    {/* Show generated actions preview if multi-action */}
                    {groupActions.length > 1 && (
                      <div className={styles.multiActionPreview}>
                        <div 
                          className={styles.multiActionPreviewHeader}
                          onClick={() => setExpandedPreviews(prev => ({ ...prev, [index]: !prev[index] }))}
                        >
                          <span>Transaction Preview ({groupActions.length} transactions)</span>
                          <button
                            type="button"
                            className={styles.expandButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPreviews(prev => ({ ...prev, [index]: !prev[index] }));
                            }}
                          >
                            {expandedPreviews[index] ? '▼' : '▶'}
                          </button>
                        </div>
                        {expandedPreviews[index] && groupActions.map((groupAction, idx) => {
                          // Decode the calldata for display
                          const decodedParams = decodeCalldata(groupAction.signature, groupAction.calldata);
                          
                          return (
                            <div key={idx} className={styles.multiActionChild}>
                              <div className={styles.multiActionLabel}>
                                {idx + 1}. Function call to contract {getContractLabel(groupAction.target)}
                              </div>
                              
                              {/* Decoded Function Call */}
                              <div className={styles.decodedFunctionCall}>
                                <div className={styles.functionSignature}>
                                  {groupAction.target.slice(0, 6)}...{groupAction.target.slice(-4)}.
                                  <span className={styles.functionName}>{groupAction.signature.split('(')[0]}</span>(
                                </div>
                                {decodedParams.map((param, paramIdx) => (
                                  <div key={paramIdx} className={styles.functionParam}>
                                    <span className={styles.paramName}>{param.name}:</span>
                                    <span className={styles.paramValue}>{param.value}</span>
                                    {paramIdx < decodedParams.length - 1 && ','}
                                  </div>
                                ))}
                                <div className={styles.functionSignature}>)</div>
                              </div>
                              
                              {/* Raw Details (collapsed) */}
                              <details className={styles.rawDetails}>
                                <summary className={styles.rawDetailsSummary}>Show raw transaction data</summary>
                                <div className={styles.actionPreview}>
                                  <div className={styles.actionPreviewRow}>
                                    <span className={styles.actionPreviewLabel}>Target:</span>
                                    <span className={styles.actionPreviewValue}>{groupAction.target}</span>
                                  </div>
                                  <div className={styles.actionPreviewRow}>
                                    <span className={styles.actionPreviewLabel}>Value:</span>
                                    <span className={styles.actionPreviewValue}>{groupAction.value}</span>
                                  </div>
                                  <div className={styles.actionPreviewRow}>
                                    <span className={styles.actionPreviewLabel}>Signature:</span>
                                    <span className={styles.actionPreviewValue}>{groupAction.signature}</span>
                                  </div>
                                  <div className={styles.actionPreviewRow}>
                                    <span className={styles.actionPreviewLabel}>Calldata:</span>
                                    <span className={styles.actionPreviewValue}>{groupAction.calldata}</span>
                                  </div>
                                </div>
                              </details>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* KYC Verification - Only show for standard and timelock proposals */}
            {isConnected && proposalType !== 'candidate' && (
              <PersonaKYC
                onComplete={handleKYCComplete}
                onError={handleKYCError}
                disabled={isCreating}
                walletAddress={address}
                proposalTitle={title}
              />
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className={styles.submitSection}>
          <button
            className={`${styles.submitButton} ${
              proposalType === 'timelock_v1' || proposalType === 'candidate' 
                ? styles.primaryButton 
                : ''
            }`}
            onClick={() => {
              if (proposalType === 'candidate') {
                handleSubmitCandidate();
              } else {
                handleSubmitProposal(proposalType === 'timelock_v1');
              }
            }}
            disabled={
              isCreating || 
              !isConnected || 
              (proposalType !== 'candidate' && !kycVerified)
            }
            title={
              proposalType !== 'candidate' && !kycVerified 
                ? 'Please complete KYC verification first' 
                : ''
            }
          >
            {isCreating 
              ? 'Creating...' 
              : proposalType === 'candidate'
                ? '📝 Create Candidate'
                : proposalType === 'timelock_v1' 
                  ? '📜 Propose on TimelockV1' 
                  : '📋 Create Proposal'}
          </button>
        </div>

        {/* Error/Success Messages */}
        {errorMessage && (
          <div className={errorMessage.includes('successfully') ? styles.success : styles.error}>
            {errorMessage}
          </div>
        )}

        {proposalState === 'success' && (
          <div className={styles.success}>
            Your proposal has been successfully created! It will appear in the proposals list once confirmed on-chain.
          </div>
        )}

        {timelockV1State === 'success' && (
          <div className={styles.success}>
            Your TimelockV1 proposal has been successfully created! It will appear in the proposals list once confirmed on-chain.
          </div>
        )}

        {candidateState === 'success' && (
          <div className={styles.success}>
            Your candidate has been successfully created! Share it with the community to gather support.
          </div>
        )}
      </div>
    </div>
  );
}

