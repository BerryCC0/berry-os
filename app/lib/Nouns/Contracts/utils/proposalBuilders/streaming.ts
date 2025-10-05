/**
 * Proposal Transaction Builders - Streaming Payment Operations
 * Build proposal actions for creating payment streams and token buying
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction, combineProposalActions } from '../governance';

/**
 * Build proposal action to create a payment stream
 * @param recipient - Address to receive stream
 * @param tokenAmount - Total amount of tokens to stream
 * @param tokenAddress - Token contract address (e.g., USDC)
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream end timestamp
 * @returns Proposal action for creating stream
 */
export function buildCreateStreamAction(
  recipient: Address,
  tokenAmount: bigint,
  tokenAddress: Address,
  startTime: bigint,
  stopTime: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.StreamFactory.address as Address,
    BigInt(0),
    'createStream(address,uint256,address,uint256,uint256)',
    [recipient, tokenAmount, tokenAddress, startTime, stopTime]
  );
}

/**
 * Build proposal action to create and fund a stream in one transaction
 * @param recipient - Address to receive stream
 * @param tokenAmount - Total amount of tokens to stream
 * @param tokenAddress - Token contract address
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream end timestamp
 * @returns Proposal action for creating and funding stream
 */
export function buildCreateAndFundStreamAction(
  recipient: Address,
  tokenAmount: bigint,
  tokenAddress: Address,
  startTime: bigint,
  stopTime: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.StreamFactory.address as Address,
    BigInt(0),
    'createAndFundStream(address,uint256,address,uint256,uint256)',
    [recipient, tokenAmount, tokenAddress, startTime, stopTime]
  );
}

/**
 * Build proposal action to buy tokens (ETH → USDC via Token Buyer)
 * @param tokenAmount - Amount of USDC to purchase
 * @returns Proposal action for buying tokens
 */
export function buildBuyTokensAction(
  tokenAmount: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'buyETH(uint256)',
    [tokenAmount]
  );
}

/**
 * Build proposal action to send or register debt via Payer
 * @param account - Recipient account
 * @param amount - Amount to send/register
 * @returns Proposal action for payer operation
 */
export function buildSendOrRegisterDebtAction(
  account: Address,
  amount: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.Payer.address as Address,
    BigInt(0),
    'sendOrRegisterDebt(address,uint256)',
    [account, amount]
  );
}

/**
 * Build proposal action to set Token Buyer admin
 * @param newAdmin - Address of new admin
 * @returns Proposal action for setting Token Buyer admin
 */
export function buildSetTokenBuyerAdminAction(
  newAdmin: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'setAdmin(address)',
    [newAdmin]
  );
}

/**
 * Build proposal action to set Token Buyer price feed
 * @param newPriceFeed - Address of new price feed
 * @returns Proposal action for setting price feed
 */
export function buildSetTokenBuyerPriceFeedAction(
  newPriceFeed: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'setPriceFeed(address)',
    [newPriceFeed]
  );
}

/**
 * Build proposal action to set Token Buyer baseline payment amount
 * @param newBaselineAmount - New baseline payment token amount
 * @returns Proposal action for setting baseline amount
 */
export function buildSetBaselinePaymentAmountAction(
  newBaselineAmount: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'setBaselinePaymentTokenAmount(uint256)',
    [newBaselineAmount]
  );
}

/**
 * Build proposal action to set Token Buyer bot discount
 * @param newBotDiscountBPs - New bot discount in basis points
 * @returns Proposal action for setting bot discount
 */
export function buildSetBotDiscountAction(
  newBotDiscountBPs: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'setBotDiscountBPs(uint16)',
    [newBotDiscountBPs]
  );
}

/**
 * Build proposal action to pause Token Buyer
 * @returns Proposal action to pause Token Buyer
 */
export function buildPauseTokenBuyerAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'pause()',
    []
  );
}

/**
 * Build proposal action to unpause Token Buyer
 * @returns Proposal action to unpause Token Buyer
 */
export function buildUnpauseTokenBuyerAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.TokenBuyer.address as Address,
    BigInt(0),
    'unpause()',
    []
  );
}

/**
 * Build monthly USDC stream to recipient
 * Helper for creating common recurring payment pattern
 * @param recipient - Address to receive monthly payments
 * @param monthlyAmount - Amount per month in USDC (smallest unit)
 * @param usdcAddress - USDC contract address
 * @param startDate - Date to start (JavaScript Date object)
 * @param durationMonths - Number of months
 * @returns Proposal action for monthly stream
 */
export function buildMonthlyStreamAction(
  recipient: Address,
  monthlyAmount: bigint,
  usdcAddress: Address,
  startDate: Date,
  durationMonths: number
): ProposalActions {
  const startTime = BigInt(Math.floor(startDate.getTime() / 1000));
  const secondsPerMonth = BigInt(30 * 24 * 60 * 60); // Approximate
  const stopTime = startTime + (secondsPerMonth * BigInt(durationMonths));
  const totalAmount = monthlyAmount * BigInt(durationMonths);
  
  return buildCreateAndFundStreamAction(
    recipient,
    totalAmount,
    usdcAddress,
    startTime,
    stopTime
  );
}

/**
 * Build grant: buy USDC + create stream
 * Common pattern for paying contributors
 * @param recipient - Grant recipient
 * @param usdcAmount - Total USDC amount
 * @param usdcAddress - USDC contract address
 * @param startTime - Stream start timestamp
 * @param duration - Stream duration in seconds
 * @returns Combined proposal actions
 */
export function buildGrantWithStreamAction(
  recipient: Address,
  usdcAmount: bigint,
  usdcAddress: Address,
  startTime: bigint,
  duration: bigint
): ProposalActions {
  const stopTime = startTime + duration;
  
  return combineProposalActions([
    buildBuyTokensAction(usdcAmount),
    buildCreateAndFundStreamAction(
      recipient,
      usdcAmount,
      usdcAddress,
      startTime,
      stopTime
    ),
  ]);
}

