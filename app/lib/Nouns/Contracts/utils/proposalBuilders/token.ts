/**
 * Proposal Transaction Builders - Token Operations
 * Build proposal actions for Nouns Token contract interactions
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction } from '../governance';

/**
 * Build proposal action to set minter (auction house)
 * @param minter - Address of new minter
 * @returns Proposal action for setting minter
 */
export function buildSetMinterAction(
  minter: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'setMinter(address)',
    [minter]
  );
}

/**
 * Build proposal action to set descriptor
 * @param descriptor - Address of new descriptor
 * @returns Proposal action for setting descriptor
 */
export function buildSetDescriptorAction(
  descriptor: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'setDescriptor(address)',
    [descriptor]
  );
}

/**
 * Build proposal action to set seeder
 * @param seeder - Address of new seeder
 * @returns Proposal action for setting seeder
 */
export function buildSetSeederAction(
  seeder: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'setSeeder(address)',
    [seeder]
  );
}

/**
 * Build proposal action to lock descriptor
 * Note: This is irreversible!
 * @returns Proposal action to lock descriptor
 */
export function buildLockDescriptorAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'lockDescriptor()',
    []
  );
}

/**
 * Build proposal action to lock seeder
 * Note: This is irreversible!
 * @returns Proposal action to lock seeder
 */
export function buildLockSeederAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'lockSeeder()',
    []
  );
}

/**
 * Build proposal action to lock minter
 * Note: This is irreversible!
 * @returns Proposal action to lock minter
 */
export function buildLockMinterAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsToken.address as Address,
    BigInt(0),
    'lockMinter()',
    []
  );
}

