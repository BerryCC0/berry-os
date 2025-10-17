/**
 * CreateProposalTab Component
 * Main proposal creation interface for Camp
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { GovernanceActions, DataProxyActions } from '@/app/lib/Nouns/Contracts';
import { 
  ProposalDraft, 
  ProposalAction, 
  ActionTemplateState,
  generateSlug,
  generateUniqueSlug
} from '@/app/lib/Persistence/proposalDrafts';
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

// Helper to flatten action templates into single actions array for submission
function flattenActionTemplates(templateStates: ActionTemplateState[]): ProposalAction[] {
  return templateStates.flatMap(state => state.generatedActions);
}

// Helper to format relative time
function formatRelativeTime(date: Date | undefined): string {
  if (!date) return '';
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(date).toLocaleDateString();
}

export default function CreateProposalTab({ onBack }: CreateProposalTabProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Form state - NEW: Using template states instead of raw actions
  const [draftSlug, setDraftSlug] = useState('');
  const [draftTitle, setDraftTitle] = useState(''); // NEW: Draft name (separate from proposal title)
  const [title, setTitle] = useState(''); // Proposal title
  const [description, setDescription] = useState('');
  const [actionTemplateStates, setActionTemplateStates] = useState<ActionTemplateState[]>([
    { templateId: 'custom', fieldValues: {}, generatedActions: [{ target: '', value: '0', signature: '', calldata: '0x' }] }
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('unsaved');

  // Load drafts on mount and select the most recent one
  useEffect(() => {
    if (address) {
      loadUserDrafts();
    }
  }, [address]);

  // Auto-load most recent draft when drafts are loaded
  useEffect(() => {
    if (drafts.length > 0 && !draftSlug && address) {
      // Load the most recent draft (first in list, sorted by updated_at DESC)
      const mostRecent = drafts[0];
      handleLoadDraft(mostRecent);
    }
  }, [drafts.length, address]);

  // Auto-save draft as user types (debounced)
  useEffect(() => {
    if (!address) return;
    
    // Generate draft title if empty (only on first keystroke in proposal title)
    if (!draftTitle && title.trim()) {
      const autoTitle = `Proposal: ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}`;
      setDraftTitle(autoTitle);
    }
    
    // Don't save completely empty drafts
    if (!draftTitle && !title.trim()) {
      setSaveStatus('unsaved');
      return;
    }

    // Mark as unsaved when content changes
    setSaveStatus('unsaved');

    // Debounce auto-save by 5 seconds
    const timeoutId = setTimeout(async () => {
      const currentDraftTitle = draftTitle || 'Untitled Proposal';
      const currentDraftSlug = draftSlug || generateUniqueSlug(generateSlug(currentDraftTitle));
      
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_slug: currentDraftSlug,
        draft_title: currentDraftTitle,
        title,
        description,
        actions: flattenActionTemplates(actionTemplateStates),
        action_templates: actionTemplateStates,
        proposal_type: proposalType,
        kyc_verified: kycVerified,
        kyc_inquiry_id: kycInquiryId,
      };

      setSaveStatus('saving');

      try {
        // Auto-save silently in background
        await fetch('/api/proposals/drafts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        
        // Update slug if it was just generated
        if (!draftSlug) {
          setDraftSlug(currentDraftSlug);
        }
        if (!draftTitle) {
          setDraftTitle(currentDraftTitle);
        }
        
        setLastSaved(new Date());
        setSaveStatus('saved');
        
        // Reload drafts list to show updated timestamp
        loadUserDrafts();
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('error');
      }
    }, 5000); // 5 second debounce

    return () => clearTimeout(timeoutId);
  }, [draftTitle, title, description, actionTemplateStates, proposalType, kycVerified, kycInquiryId, address]);

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

    if (!draftTitle.trim()) {
      setErrorMessage('Please enter a draft title');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const currentDraftSlug = draftSlug || generateUniqueSlug(generateSlug(draftTitle));
      
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_slug: currentDraftSlug,
        draft_title: draftTitle.trim(),
        title,
        description,
        actions: flattenActionTemplates(actionTemplateStates),
        action_templates: actionTemplateStates,
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
        // Update slug if it was just generated
        if (!draftSlug) {
          setDraftSlug(currentDraftSlug);
        }
        
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
    setDraftSlug(draft.draft_slug);
    setDraftTitle(draft.draft_title);
    setTitle(draft.title);
    setDescription(draft.description);
    
    // Load action templates if available, otherwise convert actions to custom templates
    if (draft.action_templates && draft.action_templates.length > 0) {
      setActionTemplateStates(draft.action_templates);
    } else if (draft.actions && draft.actions.length > 0) {
      // Fallback for old drafts: convert actions to custom templates
      const customTemplates: ActionTemplateState[] = draft.actions.map(action => ({
        templateId: 'custom' as const,
        fieldValues: {},
        generatedActions: [action]
      }));
      setActionTemplateStates(customTemplates);
    } else {
      // Empty draft
      setActionTemplateStates([
        { templateId: 'custom', fieldValues: {}, generatedActions: [{ target: '', value: '0', signature: '', calldata: '0x' }] }
      ]);
    }
    
    setProposalType(draft.proposal_type);
    setKycVerified(draft.kyc_verified);
    setKycInquiryId(draft.kyc_inquiry_id);
    setErrorMessage(null);
    setLastSaved(draft.updated_at || null);
    setSaveStatus('saved');
  };

  const handleDeleteDraft = async (draftSlugToDelete: string) => {
    if (!address) return;

    try {
      const response = await fetch(`/api/proposals/drafts/delete?wallet=${address}&slug=${encodeURIComponent(draftSlugToDelete)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadUserDrafts();
        
        // Clear form if deleting current draft
        if (draftSlug === draftSlugToDelete) {
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

  const handleRenameDraft = async (draftSlugToRename: string, newTitle: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/proposals/drafts/rename', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          draft_slug: draftSlugToRename,
          new_title: newTitle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state if renaming current draft
        if (draftSlug === draftSlugToRename) {
          setDraftTitle(newTitle);
        }
        
        // Reload drafts list
        await loadUserDrafts();
      } else {
        setErrorMessage(data.error || 'Failed to rename draft');
      }
    } catch (error) {
      console.error('Error renaming draft:', error);
      setErrorMessage('Failed to rename draft');
    }
  };

  const handleNewDraft = () => {
    // Clear all state for a fresh draft
    setDraftSlug('');
    setDraftTitle('');
    setTitle('');
    setDescription('');
    setActionTemplateStates([
      { templateId: 'custom', fieldValues: {}, generatedActions: [{ target: '', value: '0', signature: '', calldata: '0x' }] }
    ]);
    setProposalType('standard');
    setKycVerified(false);
    setKycInquiryId(undefined);
    setErrorMessage(null);
    setProposalState('idle');
    setTimelockV1State('idle');
    setCandidateState('idle');
    setLastSaved(null);
    setSaveStatus('unsaved');
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
    setActionTemplateStates([
      ...actionTemplateStates, 
      { templateId: 'custom', fieldValues: {}, generatedActions: [{ target: '', value: '0', signature: '', calldata: '0x' }] }
    ]);
  };

  const removeAction = (index: number) => {
    if (actionTemplateStates.length > 1) {
      setActionTemplateStates(prevStates => prevStates.filter((_, i) => i !== index));
    }
  };

  const updateTemplateState = React.useCallback((index: number, newState: ActionTemplateState) => {
    setActionTemplateStates(prevStates => {
      const updatedStates = [...prevStates];
      updatedStates[index] = newState;
      return updatedStates;
    });
  }, []);

  // Note: We no longer need handleActionsGenerated - template states are updated directly via updateTemplateState

  const validateForm = (requireKYC: boolean = false) => {
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return false;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required');
      return false;
    }

    // KYC is optional - warn but don't block submission
    // Note: If proposal succeeds without KYC, it may not be executed
    // (No validation needed - just a warning shown in UI)

    // Flatten and validate all actions from template states
    const allActions = flattenActionTemplates(actionTemplateStates);
    for (let i = 0; i < allActions.length; i++) {
      const action = allActions[i];
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

      // Prepare proposal data - flatten template states to actions
      const allActions = flattenActionTemplates(actionTemplateStates);
      const targets = allActions.map(action => action.target as `0x${string}`);
      const values = allActions.map(action => BigInt(action.value));
      const signatures = allActions.map(action => action.signature);
      const calldatas = allActions.map(action => {
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

      // Determine fee amount - explicitly set to 0 for Noun holders
      const shouldPayFee = !hasVotingPower;
      const feeAmount = shouldPayFee && candidateCost ? candidateCost : BigInt(0);

      // Add value for fee (must be 0 if waived)
      const txConfig = {
        ...config,
        value: feeAmount,
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
      // Prepare proposal data - flatten template states to actions
      const allActions = flattenActionTemplates(actionTemplateStates);
      const targets = allActions.map(action => action.target as `0x${string}`);
      const values = allActions.map(action => BigInt(action.value));
      const signatures = allActions.map(action => action.signature);
      const calldatas = allActions.map(action => {
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
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Create Proposal</h2>
          {draftTitle && (
            <div className={styles.draftIndicator}>
              <span className={styles.draftName}>Draft: {draftTitle}</span>
              {title && <span className={styles.separator}>•</span>}
              {title && <span className={styles.proposalTitle}>Proposal: {title.substring(0, 40)}{title.length > 40 ? '...' : ''}</span>}
              <span className={styles.separator}>•</span>
              {saveStatus === 'saving' && <span className={styles.savingIndicator}>💾 Saving...</span>}
              {saveStatus === 'saved' && lastSaved && (
                <span className={styles.savedIndicator}>✓ Saved {formatRelativeTime(lastSaved)}</span>
              )}
              {saveStatus === 'unsaved' && <span className={styles.unsavedIndicator}>● Unsaved changes</span>}
              {saveStatus === 'error' && <span className={styles.errorIndicator}>⚠️ Save failed</span>}
            </div>
          )}
        </div>
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
          currentDraft={drafts.find(d => d.draft_slug === draftSlug) || null}
          onLoad={handleLoadDraft}
          onDelete={handleDeleteDraft}
          onRename={handleRenameDraft}
          onNew={handleNewDraft}
          disabled={isCreating}
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
                  {' '}Fee: {(Number(candidateCost) / 1e18).toFixed(4)} ETH (waived for Noun owners and those with delegated votes)
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

              {actionTemplateStates.map((templateState, index) => {
                // Get generated actions from this template state
                const groupActions = templateState.generatedActions;
                
                return (
                  <div key={index} className={styles.actionContainer}>
                    {actionTemplateStates.length > 1 && (
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
                    
                    {/* Render full ActionTemplateEditor with template state */}
                    <ActionTemplateEditor
                      index={index}
                      templateState={templateState}
                      onUpdateTemplateState={(newState) => updateTemplateState(index, newState)}
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
              !isConnected
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

        {/* KYC Warning for non-candidate proposals */}
        {proposalType !== 'candidate' && !kycVerified && isConnected && (
          <div className={styles.warning}>
            ⚠️ <strong>KYC Not Completed:</strong> You can still submit this proposal, but if it succeeds and you haven't completed KYC, it may not be executed. Contact the Nouns DUNA Admins for more information.
          </div>
        )}

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

