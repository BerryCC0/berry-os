/**
 * Proposal Transaction Builders - Treasury Operations
 * Build proposal actions for Treasury contract interactions
 */

import { Address, parseEther } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { combineProposalActions, createProposalAction } from '../governance';

/**
 * Build proposal action to send ETH from treasury
 * @param recipient - Address to receive ETH
 * @param amount - Amount in ETH as string (e.g., "10.5")
 * @param description - Optional description for this action
 * @returns Proposal action for ETH transfer
 */
export function buildSendEthAction(
  recipient: Address,
  amount: string,
  description?: string
): ProposalActions {
  const value = parseEther(amount);
  
  return createProposalAction(
    recipient,
    value,
    '', // No function signature for plain ETH transfer
    []
  );
}

/**
 * Build proposal action to send ERC20 tokens from treasury
 * @param tokenAddress - ERC20 token contract address
 * @param recipient - Address to receive tokens
 * @param amount - Amount in token's smallest unit (wei for 18 decimals)
 * @returns Proposal action for ERC20 transfer
 */
export function buildSendERC20Action(
  tokenAddress: Address,
  recipient: Address,
  amount: bigint
): ProposalActions {
  return createProposalAction(
    tokenAddress,
    BigInt(0), // No ETH value
    'transfer(address,uint256)',
    [recipient, amount]
  );
}

/**
 * Build proposal action to approve ERC20 spending from treasury
 * @param tokenAddress - ERC20 token contract address
 * @param spender - Address to approve
 * @param amount - Amount to approve
 * @returns Proposal action for ERC20 approval
 */
export function buildApproveERC20Action(
  tokenAddress: Address,
  spender: Address,
  amount: bigint
): ProposalActions {
  return createProposalAction(
    tokenAddress,
    BigInt(0),
    'approve(address,uint256)',
    [spender, amount]
  );
}

/**
 * Build proposal action to set treasury delay
 * @param newDelay - New delay in seconds
 * @returns Proposal action for setting delay
 */
export function buildSetTreasuryDelayAction(
  newDelay: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsTreasury.proxy as Address,
    BigInt(0),
    'setDelay(uint256)',
    [newDelay]
  );
}

/**
 * Build proposal action to set pending admin for treasury
 * @param newPendingAdmin - Address of new pending admin
 * @returns Proposal action for setting pending admin
 */
export function buildSetTreasuryPendingAdminAction(
  newPendingAdmin: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsTreasury.proxy as Address,
    BigInt(0),
    'setPendingAdmin(address)',
    [newPendingAdmin]
  );
}

/**
 * Build multi-recipient ETH distribution
 * @param distributions - Array of {recipient, amount} pairs
 * @returns Combined proposal actions for multiple ETH transfers
 */
export function buildBatchEthDistribution(
  distributions: Array<{ recipient: Address; amount: string }>
): ProposalActions {
  const actions = distributions.map(({ recipient, amount }) =>
    buildSendEthAction(recipient, amount)
  );
  
  return combineProposalActions(actions);
}

/**
 * Build multi-recipient ERC20 distribution
 * @param tokenAddress - ERC20 token contract
 * @param distributions - Array of {recipient, amount} pairs
 * @returns Combined proposal actions for multiple token transfers
 */
export function buildBatchERC20Distribution(
  tokenAddress: Address,
  distributions: Array<{ recipient: Address; amount: bigint }>
): ProposalActions {
  const actions = distributions.map(({ recipient, amount }) =>
    buildSendERC20Action(tokenAddress, recipient, amount)
  );
  
  return combineProposalActions(actions);
}

