/**
 * Treasury Timelock - Write Functions
 * Transaction builders for treasury timelock operations
 */

import { Address, encodeFunctionData } from 'viem';
import { TreasuryTimelockABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';
import { calculateTransactionHash, calculateETA } from './read';

/**
 * Prepare queue transaction
 * @param target - Target contract address
 * @param value - ETH value to send (in wei)
 * @param signature - Function signature (e.g., "transfer(address,uint256)")
 * @param data - Encoded function data
 * @param delay - Current timelock delay from contract
 * @returns Transaction config for wagmi
 */
export function prepareQueueTransaction(
  target: Address,
  value: bigint,
  signature: string,
  data: string,
  delay: bigint
) {
  const eta = calculateETA(delay);
  
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'queueTransaction',
    args: [target, value, signature, data as `0x${string}`, eta],
  } as const;
}

/**
 * Prepare execute transaction
 * @param target - Target contract address
 * @param value - ETH value to send (in wei)
 * @param signature - Function signature
 * @param data - Encoded function data
 * @param eta - Execution timestamp (from when it was queued)
 * @returns Transaction config for wagmi
 */
export function prepareExecuteTransaction(
  target: Address,
  value: bigint,
  signature: string,
  data: string,
  eta: bigint
) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'executeTransaction',
    args: [target, value, signature, data as `0x${string}`, eta],
  } as const;
}

/**
 * Prepare cancel transaction
 * @param target - Target contract address
 * @param value - ETH value to send (in wei)
 * @param signature - Function signature
 * @param data - Encoded function data
 * @param eta - Execution timestamp (from when it was queued)
 * @returns Transaction config for wagmi
 */
export function prepareCancelTransaction(
  target: Address,
  value: bigint,
  signature: string,
  data: string,
  eta: bigint
) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'cancelTransaction',
    args: [target, value, signature, data as `0x${string}`, eta],
  } as const;
}

/**
 * Prepare send ETH transaction
 * @param recipient - Address to send ETH to
 * @param amount - Amount of ETH to send (in wei)
 * @returns Transaction config for wagmi
 */
export function prepareSendETH(
  recipient: Address,
  amount: bigint
) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'sendETH',
    args: [recipient, amount],
  } as const;
}

/**
 * Prepare send ERC20 transaction
 * @param recipient - Address to send tokens to
 * @param token - ERC20 token address
 * @param amount - Amount of tokens to send (in token's smallest unit)
 * @returns Transaction config for wagmi
 */
export function prepareSendERC20(
  recipient: Address,
  token: Address,
  amount: bigint
) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'sendERC20',
    args: [recipient, token, amount],
  } as const;
}

/**
 * Prepare accept admin transaction
 * Only callable by pending admin
 * @returns Transaction config for wagmi
 */
export function prepareAcceptAdmin() {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'acceptAdmin',
  } as const;
}

/**
 * Prepare set pending admin transaction
 * Only callable by current admin (DAO)
 * @param newPendingAdmin - Address of new pending admin
 * @returns Transaction config for wagmi
 */
export function prepareSetPendingAdmin(newPendingAdmin: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'setPendingAdmin',
    args: [newPendingAdmin],
  } as const;
}

/**
 * Prepare set delay transaction
 * Only callable by timelock itself (through queue/execute)
 * @param newDelay - New delay in seconds
 * @returns Transaction config for wagmi
 */
export function prepareSetDelay(newDelay: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'setDelay',
    args: [newDelay],
  } as const;
}

/**
 * Helper: Build common treasury transaction
 * @param action - Action type
 * @param params - Transaction parameters
 * @returns Prepared transaction
 */
export function buildTreasuryTransaction(
  action: 'sendETH' | 'sendERC20' | 'queueTransaction' | 'executeTransaction' | 'cancelTransaction',
  params: {
    recipient?: Address;
    token?: Address;
    amount?: bigint;
    target?: Address;
    value?: bigint;
    signature?: string;
    data?: string;
    eta?: bigint;
    delay?: bigint;
  }
) {
  switch (action) {
    case 'sendETH':
      if (!params.recipient || params.amount === undefined) {
        throw new Error('sendETH requires recipient and amount');
      }
      return prepareSendETH(params.recipient, params.amount);
      
    case 'sendERC20':
      if (!params.recipient || !params.token || params.amount === undefined) {
        throw new Error('sendERC20 requires recipient, token, and amount');
      }
      return prepareSendERC20(params.recipient, params.token, params.amount);
      
    case 'queueTransaction':
      if (!params.target || params.value === undefined || !params.signature || !params.data || !params.delay) {
        throw new Error('queueTransaction requires target, value, signature, data, and delay');
      }
      return prepareQueueTransaction(params.target, params.value, params.signature, params.data, params.delay);
      
    case 'executeTransaction':
      if (!params.target || params.value === undefined || !params.signature || !params.data || !params.eta) {
        throw new Error('executeTransaction requires target, value, signature, data, and eta');
      }
      return prepareExecuteTransaction(params.target, params.value, params.signature, params.data, params.eta);
      
    case 'cancelTransaction':
      if (!params.target || params.value === undefined || !params.signature || !params.data || !params.eta) {
        throw new Error('cancelTransaction requires target, value, signature, data, and eta');
      }
      return prepareCancelTransaction(params.target, params.value, params.signature, params.data, params.eta);
      
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Validate send ETH parameters
 */
export function validateSendETH(recipient: Address, amount: bigint): { valid: boolean; error?: string } {
  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  return { valid: true };
}

/**
 * Validate send ERC20 parameters
 */
export function validateSendERC20(
  recipient: Address,
  token: Address,
  amount: bigint
): { valid: boolean; error?: string } {
  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (!token || token === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid token address' };
  }
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  return { valid: true };
}

