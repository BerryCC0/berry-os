/**
 * Nouns DAO Governance - Write Functions
 * Helper functions for preparing governance write transactions
 */

import { Address, encodeAbiParameters, parseAbiParameters } from 'viem';
import { CONTRACTS, BERRY_OS_CLIENT_ID, VOTE_SUPPORT } from '../constants';
import { NounsDAOLogicV3ABI } from '../../abis';
import type { ProposalActions } from '../types';

/**
 * Prepare vote transaction with Berry OS client ID
 * @param proposalId - Proposal ID to vote on
 * @param support - Vote support (0=Against, 1=For, 2=Abstain)
 * @param reason - Optional vote reason
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareVoteTransaction(
  proposalId: bigint,
  support: number,
  reason: string = ''
) {
  return {
    address: CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'castRefundableVoteWithReason' as const,
    args: [proposalId, support, reason, BERRY_OS_CLIENT_ID],
  };
}

/**
 * Prepare vote FOR transaction
 * @param proposalId - Proposal ID
 * @param reason - Optional vote reason
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareVoteForTransaction(proposalId: bigint, reason: string = '') {
  return prepareVoteTransaction(proposalId, VOTE_SUPPORT.FOR, reason);
}

/**
 * Prepare vote AGAINST transaction
 * @param proposalId - Proposal ID
 * @param reason - Optional vote reason
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareVoteAgainstTransaction(proposalId: bigint, reason: string = '') {
  return prepareVoteTransaction(proposalId, VOTE_SUPPORT.AGAINST, reason);
}

/**
 * Prepare ABSTAIN transaction
 * @param proposalId - Proposal ID
 * @param reason - Optional vote reason
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareAbstainTransaction(proposalId: bigint, reason: string = '') {
  return prepareVoteTransaction(proposalId, VOTE_SUPPORT.ABSTAIN, reason);
}

/**
 * Prepare propose transaction with NounsOS client ID
 * @param actions - Proposal actions (targets, values, signatures, calldatas)
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareProposeTransaction(
  actions: ProposalActions,
  description: string
) {
  return {
    address: CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposeOnTimelockV1' as const,
    args: [
      actions.targets,
      actions.values,
      actions.signatures,
      actions.calldatas,
      description,
    ],
  };
}

/**
 * Prepare cancel proposal transaction
 * @param proposalId - Proposal ID to cancel
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCancelTransaction(proposalId: bigint) {
  return {
    address: CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'cancel' as const,
    args: [proposalId],
  };
}

/**
 * Prepare queue proposal transaction
 * @param proposalId - Proposal ID to queue
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareQueueTransaction(proposalId: bigint) {
  return {
    address: CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'queue' as const,
    args: [proposalId],
  };
}

/**
 * Prepare execute proposal transaction
 * @param proposalId - Proposal ID to execute
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareExecuteTransaction(proposalId: bigint) {
  return {
    address: CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'execute' as const,
    args: [proposalId],
  };
}

/**
 * Validate vote support value
 * @param support - Support value to validate
 * @returns True if valid support value (0, 1, or 2)
 */
export function isValidVoteSupport(support: number): boolean {
  return support === 0 || support === 1 || support === 2;
}

/**
 * Validate proposal actions
 * @param actions - Proposal actions to validate
 * @returns Error message or null if valid
 */
export function validateProposalActions(actions: ProposalActions): string | null {
  const { targets, values, signatures, calldatas } = actions;
  
  // Check that all arrays have the same length
  if (
    targets.length !== values.length ||
    targets.length !== signatures.length ||
    targets.length !== calldatas.length
  ) {
    return 'All action arrays must have the same length';
  }
  
  // Check that there is at least one action
  if (targets.length === 0) {
    return 'At least one action is required';
  }
  
  // Check that all targets are valid addresses
  for (const target of targets) {
    if (!target || target === '0x0000000000000000000000000000000000000000') {
      return 'Invalid target address';
    }
  }
  
  return null;
}

/**
 * Encode function call data
 * @param signature - Function signature (e.g., "transfer(address,uint256)")
 * @param params - Parameter values
 * @returns Encoded calldata
 */
export function encodeFunctionCall(signature: string, params: unknown[]): `0x${string}` {
  // Extract parameter types from signature
  const match = signature.match(/\((.*?)\)/);
  if (!match) {
    throw new Error('Invalid function signature');
  }
  
  const paramTypes = match[1];
  if (!paramTypes) {
    return '0x' as `0x${string}`;
  }
  
  return encodeAbiParameters(
    parseAbiParameters(paramTypes),
    params as readonly unknown[]
  );
}

/**
 * Create simple proposal action
 * @param target - Target contract address
 * @param value - ETH value to send
 * @param signature - Function signature
 * @param params - Function parameters
 * @returns Single proposal action
 */
export function createProposalAction(
  target: Address,
  value: bigint,
  signature: string,
  params: unknown[]
): ProposalActions {
  const calldata = signature ? encodeFunctionCall(signature, params) : ('0x' as `0x${string}`);
  
  return {
    targets: [target],
    values: [value],
    signatures: [signature],
    calldatas: [calldata],
  };
}

/**
 * Combine multiple proposal actions
 * @param actions - Array of proposal actions to combine
 * @returns Combined proposal actions
 */
export function combineProposalActions(actions: ProposalActions[]): ProposalActions {
  return {
    targets: actions.flatMap(a => a.targets),
    values: actions.flatMap(a => a.values),
    signatures: actions.flatMap(a => a.signatures),
    calldatas: actions.flatMap(a => a.calldatas),
  };
}

