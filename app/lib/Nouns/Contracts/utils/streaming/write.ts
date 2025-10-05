/**
 * Stream Factory - Write Functions
 * Transaction builders for stream factory operations
 */

import { Address } from 'viem';
import { StreamFactoryABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Prepare create stream transaction
 * @param payer - Address paying for the stream
 * @param recipient - Address receiving the stream
 * @param tokenAmount - Amount of tokens to stream (USDC with 6 decimals)
 * @param tokenAddress - Token contract address (USDC)
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream stop timestamp
 * @param nonce - Unique nonce for this stream
 * @returns Transaction config for wagmi
 */
export function prepareCreateStream(
  payer: Address,
  recipient: Address,
  tokenAmount: bigint,
  tokenAddress: Address,
  startTime: bigint,
  stopTime: bigint,
  nonce: bigint
) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'createStream',
    args: [payer, recipient, tokenAmount, tokenAddress, startTime, stopTime, nonce],
  } as const;
}

/**
 * Prepare withdraw from stream transaction
 * @param streamId - ID of the stream
 * @param amount - Amount to withdraw
 * @returns Transaction config for wagmi
 */
export function prepareWithdrawFromStream(streamId: bigint, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'withdrawFromStream',
    args: [streamId, amount],
  } as const;
}

/**
 * Prepare cancel stream transaction
 * @param streamId - ID of the stream to cancel
 * @returns Transaction config for wagmi
 */
export function prepareCancelStream(streamId: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'cancelStream',
    args: [streamId],
  } as const;
}

/**
 * Prepare rescue ERC20 transaction
 * @param tokenAddress - Token to rescue
 * @param recipient - Address to send rescued tokens to
 * @param amount - Amount to rescue
 * @returns Transaction config for wagmi
 */
export function prepareRescueERC20(tokenAddress: Address, recipient: Address, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'rescueERC20',
    args: [tokenAddress, recipient, amount],
  } as const;
}

/**
 * Prepare rescue ETH transaction
 * @param recipient - Address to send rescued ETH to
 * @param amount - Amount of ETH to rescue
 * @returns Transaction config for wagmi
 */
export function prepareRescueETH(recipient: Address, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'rescueETH',
    args: [recipient, amount],
  } as const;
}

/**
 * Validate create stream parameters
 */
export function validateCreateStream(
  payer: Address,
  recipient: Address,
  tokenAmount: bigint,
  startTime: bigint,
  stopTime: bigint
): { valid: boolean; error?: string } {
  if (!payer || payer === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid payer address' };
  }
  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (tokenAmount <= BigInt(0)) {
    return { valid: false, error: 'Token amount must be greater than 0' };
  }
  if (stopTime <= startTime) {
    return { valid: false, error: 'Stop time must be after start time' };
  }
  return { valid: true };
}

/**
 * Generate unique nonce for stream
 * @returns Random nonce
 */
export function generateStreamNonce(): bigint {
  return BigInt(Math.floor(Math.random() * 1e18));
}

