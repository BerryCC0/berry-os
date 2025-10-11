/**
 * Nouns Token Actions
 * User-facing actions for Nouns Token (ERC-721 with delegation)
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { NounsTokenABI } from '../abis';
import { validateAddress, validateNounId } from './validation';

// ============================================================================
// DELEGATION ACTIONS
// ============================================================================

/**
 * Delegate voting power to an address
 * 
 * @param delegatee - Address to delegate to
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = delegate('0x...');
 * await writeContractAsync(config);
 */
export function delegate(delegatee: Address) {
  validateAddress(delegatee, 'Delegatee address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'delegate' as const,
    args: [delegatee] as const,
  };
}

// ============================================================================
// TRANSFER ACTIONS
// ============================================================================

/**
 * Transfer a Noun to another address
 * 
 * @param from - Current owner address
 * @param to - Recipient address
 * @param tokenId - Noun ID to transfer
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = transferFrom('0x...', '0x...', BigInt(123));
 * await writeContractAsync(config);
 */
export function transferFrom(from: Address, to: Address, tokenId: bigint) {
  validateAddress(from, 'From address');
  validateAddress(to, 'To address');
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'transferFrom' as const,
    args: [from, to, tokenId] as const,
  };
}

/**
 * Safe transfer a Noun to another address
 * 
 * @param from - Current owner address
 * @param to - Recipient address
 * @param tokenId - Noun ID to transfer
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = safeTransferFrom('0x...', '0x...', BigInt(123));
 * await writeContractAsync(config);
 */
export function safeTransferFrom(from: Address, to: Address, tokenId: bigint) {
  validateAddress(from, 'From address');
  validateAddress(to, 'To address');
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'safeTransferFrom' as const,
    args: [from, to, tokenId] as const,
  };
}

/**
 * Approve an address to transfer a Noun
 * 
 * @param to - Address to approve
 * @param tokenId - Noun ID to approve
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = approve('0x...', BigInt(123));
 * await writeContractAsync(config);
 */
export function approve(to: Address, tokenId: bigint) {
  validateAddress(to, 'Approved address');
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'approve' as const,
    args: [to, tokenId] as const,
  };
}

/**
 * Set approval for all Nouns to an operator
 * 
 * @param operator - Operator address
 * @param approved - True to approve, false to revoke
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = setApprovalForAll('0x...', true);
 * await writeContractAsync(config);
 */
export function setApprovalForAll(operator: Address, approved: boolean) {
  validateAddress(operator, 'Operator address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'setApprovalForAll' as const,
    args: [operator, approved] as const,
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get Noun balance of an address
 * 
 * @param owner - Owner address
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: balance } = useReadContract(balanceOf('0x...'));
 * // balance = 5n (owns 5 Nouns)
 */
export function balanceOf(owner: Address) {
  validateAddress(owner, 'Owner address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'balanceOf' as const,
    args: [owner] as const,
  };
}

/**
 * Get owner of a Noun
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: owner } = useReadContract(ownerOf(BigInt(123)));
 * // owner = '0x...'
 */
export function ownerOf(tokenId: bigint) {
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'ownerOf' as const,
    args: [tokenId] as const,
  };
}

/**
 * Get total supply of Nouns
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: totalSupply } = useReadContract(totalSupply());
 * // totalSupply = 1234n
 */
export function totalSupply() {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'totalSupply' as const,
  };
}

/**
 * Get trait seed for a Noun
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: seed } = useReadContract(seeds(BigInt(123)));
 * // seed = { background, body, accessory, head, glasses }
 */
export function seeds(tokenId: bigint) {
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'seeds' as const,
    args: [tokenId] as const,
  };
}

/**
 * Get on-chain data URI for a Noun (SVG + metadata)
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: dataURI } = useReadContract(dataURI(BigInt(123)));
 * // dataURI = 'data:application/json;base64,...'
 */
export function dataURI(tokenId: bigint) {
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'dataURI' as const,
    args: [tokenId] as const,
  };
}

/**
 * Get token URI for a Noun
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 */
export function tokenURI(tokenId: bigint) {
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'tokenURI' as const,
    args: [tokenId] as const,
  };
}

// ============================================================================
// DELEGATION QUERIES
// ============================================================================

/**
 * Get current delegate for an address
 * 
 * @param account - Account address
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: delegate } = useReadContract(delegates('0x...'));
 * // delegate = '0x...'
 */
export function delegates(account: Address) {
  validateAddress(account, 'Account address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'delegates' as const,
    args: [account] as const,
  };
}

/**
 * Get current voting power for an address
 * 
 * @param account - Account address
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: votes } = useReadContract(getCurrentVotes('0x...'));
 * // votes = 10n (10 votes)
 */
export function getCurrentVotes(account: Address) {
  validateAddress(account, 'Account address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'getCurrentVotes' as const,
    args: [account] as const,
  };
}

/**
 * Get historical voting power at a specific block
 * 
 * @param account - Account address
 * @param blockNumber - Block number
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: votes } = useReadContract(getPriorVotes('0x...', BigInt(12345678)));
 * // votes = 10n
 */
export function getPriorVotes(account: Address, blockNumber: bigint) {
  validateAddress(account, 'Account address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'getPriorVotes' as const,
    args: [account, blockNumber] as const,
  };
}

/**
 * Get number of checkpoints for an address
 * 
 * @param account - Account address
 * @returns Query config for wagmi useReadContract
 */
export function numCheckpoints(account: Address) {
  validateAddress(account, 'Account address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'numCheckpoints' as const,
    args: [account] as const,
  };
}

/**
 * Get checkpoint data for an address
 * 
 * @param account - Account address
 * @param index - Checkpoint index
 * @returns Query config for wagmi useReadContract
 */
export function checkpoints(account: Address, index: number) {
  validateAddress(account, 'Account address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'checkpoints' as const,
    args: [account, index] as const,
  };
}

// ============================================================================
// APPROVAL QUERIES
// ============================================================================

/**
 * Get approved address for a Noun
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 */
export function getApproved(tokenId: bigint) {
  validateNounId(tokenId);
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'getApproved' as const,
    args: [tokenId] as const,
  };
}

/**
 * Check if operator is approved for all tokens of owner
 * 
 * @param owner - Owner address
 * @param operator - Operator address
 * @returns Query config for wagmi useReadContract
 */
export function isApprovedForAll(owner: Address, operator: Address) {
  validateAddress(owner, 'Owner address');
  validateAddress(operator, 'Operator address');
  
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'isApprovedForAll' as const,
    args: [owner, operator] as const,
  };
}
