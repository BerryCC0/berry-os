/**
 * Payer - Write Functions
 * Transaction builders for payer operations
 */

import { Address } from 'viem';
import { PayerABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Prepare pay transaction
 * Send USDC payment to recipient
 * @param recipient - Address to send payment to
 * @param amount - Amount of USDC to send (6 decimals)
 * @param reason - Payment reason/description
 * @returns Transaction config for wagmi
 */
export function preparePay(recipient: Address, amount: bigint, reason: string) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'pay',
    args: [recipient, amount, reason],
  } as const;
}

/**
 * Prepare send or register debt transaction
 * Attempt payment, register as debt if insufficient balance
 * @param recipient - Address to send payment to
 * @param amount - Amount of USDC
 * @param reason - Payment reason
 * @returns Transaction config for wagmi
 */
export function prepareSendOrRegisterDebt(recipient: Address, amount: bigint, reason: string) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'sendOrRegisterDebt',
    args: [recipient, amount, reason],
  } as const;
}

/**
 * Prepare withdraw token transaction
 * @param token - Token address to withdraw
 * @param to - Recipient address
 * @param amount - Amount to withdraw
 * @returns Transaction config for wagmi
 */
export function prepareWithdrawToken(token: Address, to: Address, amount: bigint) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'withdrawToken',
    args: [token, to, amount],
  } as const;
}

/**
 * Prepare set admin transaction
 * @param newAdmin - New admin address
 * @returns Transaction config for wagmi
 */
export function prepareSetAdmin(newAdmin: Address) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'setAdmin',
    args: [newAdmin],
  } as const;
}

/**
 * Prepare set treasury transaction
 * @param newTreasury - New treasury address
 * @returns Transaction config for wagmi
 */
export function prepareSetTreasury(newTreasury: Address) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'setTreasury',
    args: [newTreasury],
  } as const;
}

/**
 * Prepare authorize payer transaction
 * @param payer - Address to authorize
 * @returns Transaction config for wagmi
 */
export function prepareAuthorizePayer(payer: Address) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'authorizePayer',
    args: [payer],
  } as const;
}

/**
 * Prepare revoke payer transaction
 * @param payer - Address to revoke
 * @returns Transaction config for wagmi
 */
export function prepareRevokePayer(payer: Address) {
  return {
    address: NOUNS_CONTRACTS.Payer.address as Address,
    abi: PayerABI,
    functionName: 'revokePayer',
    args: [payer],
  } as const;
}

/**
 * Validate payment parameters
 */
export function validatePayment(
  recipient: Address,
  amount: bigint,
  reason: string
): { valid: boolean; error?: string } {
  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!reason || reason.trim().length === 0) {
    return { valid: false, error: 'Payment reason is required' };
  }
  if (reason.length > 256) {
    return { valid: false, error: 'Reason too long (max 256 characters)' };
  }
  return { valid: true };
}

