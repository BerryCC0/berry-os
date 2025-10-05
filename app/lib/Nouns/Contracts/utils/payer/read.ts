/**
 * Payer - Read Functions
 * Pure functions and utilities for reading payer data
 */

import { Address, formatUnits } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Get Payer contract address
 * @returns Payer address
 */
export function getPayerAddress(): Address {
  return NOUNS_CONTRACTS.Payer.address as Address;
}

/**
 * Check if address is authorized payer
 * @param address - Address to check
 * @param isAuthorized - Authorization status from contract
 * @returns True if authorized
 */
export function isAuthorizedPayer(address: Address, isAuthorized: boolean): boolean {
  return isAuthorized;
}

/**
 * Check if address is admin
 * @param address - Address to check
 * @param adminAddress - Current admin from contract
 * @returns True if address is admin
 */
export function isPayerAdmin(address: Address, adminAddress: Address): boolean {
  return address.toLowerCase() === adminAddress.toLowerCase();
}

/**
 * Format USDC payment amount
 * @param amount - Amount in USDC's smallest unit (6 decimals)
 * @returns Formatted string
 */
export function formatPaymentAmount(amount: bigint): string {
  return '$' + Number(formatUnits(amount, 6)).toLocaleString();
}

/**
 * Calculate total payment amount
 * @param baseAmount - Base payment amount
 * @param feePercentage - Fee percentage (e.g., 2.5 for 2.5%)
 * @returns Total amount including fees
 */
export function calculateTotalWithFees(baseAmount: bigint, feePercentage: number): bigint {
  const feeMultiplier = BigInt(Math.floor((1 + feePercentage / 100) * 1000));
  return (baseAmount * feeMultiplier) / BigInt(1000);
}

/**
 * Check if payment amount is valid
 * @param amount - Payment amount
 * @param minAmount - Minimum payment amount
 * @param maxAmount - Maximum payment amount
 * @returns Validation result
 */
export function validatePaymentAmount(
  amount: bigint,
  minAmount: bigint = BigInt(100000), // $0.1 USDC
  maxAmount: bigint = BigInt(1000000000000) // $1M USDC
): { valid: boolean; error?: string } {
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < minAmount) {
    return { valid: false, error: 'Amount below minimum' };
  }
  if (amount > maxAmount) {
    return { valid: false, error: 'Amount exceeds maximum' };
  }
  return { valid: true };
}

/**
 * Parse payment reason
 * @param reason - Payment reason string
 * @returns Parsed and validated reason
 */
export function parsePaymentReason(reason: string): string {
  return reason.trim().slice(0, 256); // Limit to 256 chars
}

/**
 * USDC decimals constant
 */
export const USDC_DECIMALS = 6;


// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

import { PayerABI } from '../../abis';

/**
 * Check if address is authorized payer
 * @param address - Address to check
 * @returns Wagmi read config
 */
export function checkIsAuthorizedPayer(address: Address) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'isAuthorizedPayer',
    args: [address],
  } as const;
}

/**
 * Get admin address
 * @returns Wagmi read config
 */
export function getAdmin() {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'admin',
  } as const;
}

/**
 * Get treasury address
 * @returns Wagmi read config
 */
export function getTreasury() {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'treasury',
  } as const;
}
