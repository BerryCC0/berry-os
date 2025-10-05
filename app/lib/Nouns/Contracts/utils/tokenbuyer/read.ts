/**
 * Token Buyer - Read Functions
 * Pure functions and utilities for reading token buyer data
 */

import { Address, formatUnits, parseUnits } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Get Token Buyer contract address
 * @returns Token Buyer address
 */
export function getTokenBuyerAddress(): Address {
  return NOUNS_CONTRACTS.TokenBuyer.address as Address;
}

/**
 * Calculate expected USDC output for ETH input
 * @param ethAmount - ETH amount in wei
 * @param ethUsdcPrice - Current ETH/USDC price (e.g., 2000 = 1 ETH = 2000 USDC)
 * @param slippage - Slippage tolerance in basis points (e.g., 100 = 1%)
 * @returns Expected USDC amount in USDC's smallest unit
 */
export function calculateUSDCOutput(
  ethAmount: bigint,
  ethUsdcPrice: number,
  slippage: number = 100
): bigint {
  // ETH has 18 decimals, USDC has 6 decimals
  const ethFormatted = Number(formatUnits(ethAmount, 18));
  const expectedUSDC = ethFormatted * ethUsdcPrice;
  const withSlippage = expectedUSDC * (1 - slippage / 10000);
  return parseUnits(withSlippage.toFixed(6), 6);
}

/**
 * Calculate required ETH input for desired USDC output
 * @param usdcAmount - Desired USDC amount (with 6 decimals)
 * @param ethUsdcPrice - Current ETH/USDC price
 * @param slippage - Slippage tolerance in basis points
 * @returns Required ETH amount in wei
 */
export function calculateETHInput(
  usdcAmount: bigint,
  ethUsdcPrice: number,
  slippage: number = 100
): bigint {
  const usdcFormatted = Number(formatUnits(usdcAmount, 6));
  const requiredETH = usdcFormatted / ethUsdcPrice;
  const withSlippage = requiredETH * (1 + slippage / 10000);
  return parseUnits(withSlippage.toFixed(18), 18);
}

/**
 * Format ETH amount for display
 * @param amount - Amount in wei
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatETH(amount: bigint, decimals: number = 4): string {
  return Number(formatUnits(amount, 18)).toFixed(decimals) + ' ETH';
}

/**
 * Format USDC amount for display
 * @param amount - Amount in USDC's smallest unit
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatUSDC(amount: bigint, decimals: number = 2): string {
  return '$' + Number(formatUnits(amount, 6)).toFixed(decimals);
}

/**
 * Calculate price impact
 * @param inputAmount - Input ETH amount
 * @param outputAmount - Output USDC amount
 * @param marketPrice - Current market ETH/USDC price
 * @returns Price impact as percentage
 */
export function calculatePriceImpact(
  inputAmount: bigint,
  outputAmount: bigint,
  marketPrice: number
): number {
  const ethFormatted = Number(formatUnits(inputAmount, 18));
  const usdcFormatted = Number(formatUnits(outputAmount, 6));
  const executionPrice = usdcFormatted / ethFormatted;
  const impact = ((marketPrice - executionPrice) / marketPrice) * 100;
  return Math.abs(impact);
}

/**
 * Check if price impact is acceptable
 * @param impact - Price impact percentage
 * @param maxImpact - Maximum acceptable impact (default 1%)
 * @returns True if acceptable
 */
export function isAcceptablePriceImpact(impact: number, maxImpact: number = 1): boolean {
  return impact <= maxImpact;
}

/**
 * Validate buy amount
 * @param ethAmount - ETH amount to spend
 * @param minAmount - Minimum ETH amount
 * @param maxAmount - Maximum ETH amount
 * @returns Validation result
 */
export function validateBuyAmount(
  ethAmount: bigint,
  minAmount: bigint = parseUnits('0.01', 18),
  maxAmount: bigint = parseUnits('100', 18)
): { valid: boolean; error?: string } {
  if (ethAmount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (ethAmount < minAmount) {
    return { valid: false, error: `Minimum amount is ${formatETH(minAmount)}` };
  }
  if (ethAmount > maxAmount) {
    return { valid: false, error: `Maximum amount is ${formatETH(maxAmount)}` };
  }
  return { valid: true };
}

/**
 * Check if address is admin
 * @param address - Address to check
 * @param adminAddress - Current admin from contract
 * @returns True if address is admin
 */
export function isTokenBuyerAdmin(address: Address, adminAddress: Address): boolean {
  return address.toLowerCase() === adminAddress.toLowerCase();
}

/**
 * USDC contract address (mainnet)
 */
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const;

/**
 * WETH contract address (mainnet)
 */
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const;


// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

import { TokenBuyerABI } from '../../abis';

/**
 * Get admin address
 * @returns Wagmi read config
 */
export function getAdmin() {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'admin',
  } as const;
}

/**
 * Get payer address
 * @returns Wagmi read config
 */
export function getPayer() {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'payer',
  } as const;
}

/**
 * Get tokens receiver address
 * @returns Wagmi read config
 */
export function getTokensReceiver() {
  return {
    address: NOUNS_CONTRACTS.TokenBuyer.address as Address,
    abi: TokenBuyerABI,
    functionName: 'tokensReceiver',
  } as const;
}
