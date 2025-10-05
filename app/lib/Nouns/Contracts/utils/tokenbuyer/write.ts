/**
 * Token Buyer - Write Functions
 * Transaction builders for token buyer operations
 */

import { Address, parseUnits } from 'viem';
import { TokenBuyerABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';
import { USDC_ADDRESS } from './read';

/**
 * Prepare buy tokens transaction
 * Converts ETH to USDC through Uniswap
 * @param ethAmount - Amount of ETH to spend (in wei)
 * @param minUSDCOut - Minimum USDC to receive (slippage protection)
 * @returns Transaction config for wagmi
 */
export function prepareBuyTokens(ethAmount: bigint, minUSDCOut: bigint) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'buyTokens',
    args: [minUSDCOut],
    value: ethAmount,
  } as const;
}

/**
 * Prepare set admin transaction
 * @param newAdmin - Address of new admin
 * @returns Transaction config for wagmi
 */
export function prepareSetAdmin(newAdmin: Address) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setAdmin',
    args: [newAdmin],
  } as const;
}

/**
 * Prepare set payer transaction
 * @param newPayer - Address of new payer contract
 * @returns Transaction config for wagmi
 */
export function prepareSetPayer(newPayer: Address) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setPayer',
    args: [newPayer],
  } as const;
}

/**
 * Prepare set tokens receiver transaction
 * @param newReceiver - Address to receive bought tokens
 * @returns Transaction config for wagmi
 */
export function prepareSetTokensReceiver(newReceiver: Address) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setTokensReceiver',
    args: [newReceiver],
  } as const;
}

/**
 * Prepare withdraw ETH transaction
 * @param to - Address to send ETH to
 * @param amount - Amount of ETH to withdraw
 * @returns Transaction config for wagmi
 */
export function prepareWithdraw(to: Address, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'withdraw',
    args: [to, amount],
  } as const;
}

/**
 * Prepare withdraw token transaction
 * @param token - Token contract address
 * @param to - Address to send tokens to
 * @param amount - Amount of tokens to withdraw
 * @returns Transaction config for wagmi
 */
export function prepareWithdrawToken(token: Address, to: Address, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'withdrawToken',
    args: [token, to, amount],
  } as const;
}

/**
 * Prepare set bot discount BPS transaction
 * @param newBPS - New discount in basis points (e.g., 100 = 1%)
 * @returns Transaction config for wagmi
 */
export function prepareSetBotDiscountBPS(newBPS: number) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setBotDiscountBPS',
    args: [newBPS],
  } as const;
}

/**
 * Prepare set base swap fee BPS transaction
 * @param newBPS - New base fee in basis points
 * @returns Transaction config for wagmi
 */
export function prepareSetBaseSwapFeeBPS(newBPS: number) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setBaseSwapFeeBPS',
    args: [newBPS],
  } as const;
}

/**
 * Prepare set payment token transaction
 * @param newToken - Address of new payment token (e.g., USDC)
 * @returns Transaction config for wagmi
 */
export function prepareSetPaymentToken(newToken: Address) {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'setPaymentToken',
    args: [newToken],
  } as const;
}

/**
 * Validate buy tokens parameters
 */
export function validateBuyTokens(
  ethAmount: bigint,
  minUSDCOut: bigint
): { valid: boolean; error?: string } {
  if (ethAmount <= BigInt(0)) {
    return { valid: false, error: 'ETH amount must be greater than 0' };
  }
  if (minUSDCOut <= BigInt(0)) {
    return { valid: false, error: 'Minimum USDC output must be greater than 0' };
  }
  return { valid: true };
}

/**
 * Validate withdraw parameters
 */
export function validateWithdraw(
  to: Address,
  amount: bigint
): { valid: boolean; error?: string } {
  if (!to || to === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  return { valid: true };
}

/**
 * Validate BPS value
 * @param bps - Basis points value
 * @param maxBPS - Maximum allowed BPS (default 10000 = 100%)
 */
export function validateBPS(bps: number, maxBPS: number = 10000): { valid: boolean; error?: string } {
  if (bps < 0) {
    return { valid: false, error: 'BPS cannot be negative' };
  }
  if (bps > maxBPS) {
    return { valid: false, error: `BPS cannot exceed ${maxBPS}` };
  }
  return { valid: true };
}

/**
 * Helper: Calculate minimum USDC with slippage
 * @param expectedUSDC - Expected USDC amount
 * @param slippageBPS - Slippage in basis points (e.g., 100 = 1%)
 * @returns Minimum USDC with slippage applied
 */
export function calculateMinUSDCWithSlippage(expectedUSDC: bigint, slippageBPS: number): bigint {
  const slippageMultiplier = BigInt(10000 - slippageBPS);
  return (expectedUSDC * slippageMultiplier) / BigInt(10000);
}

/**
 * Common slippage presets
 */
export const SLIPPAGE_PRESETS = {
  LOW: 50,      // 0.5%
  MEDIUM: 100,  // 1%
  HIGH: 300,    // 3%
  VERY_HIGH: 500, // 5%
} as const;

