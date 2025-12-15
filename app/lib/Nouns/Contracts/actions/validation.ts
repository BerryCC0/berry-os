/**
 * Input Validation
 * Validates user inputs before creating transactions
 * Throws descriptive errors on validation failure
 */

import { Address, isAddress, parseEther } from 'viem';

// ============================================================================
// ADDRESS VALIDATION
// ============================================================================

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateAddress(address: string, fieldName: string = 'Address'): void {
  if (!address) {
    throw new Error(`${fieldName} is required`);
  }
  
  if (!isAddress(address)) {
    throw new Error(`${fieldName} is not a valid Ethereum address`);
  }
}

/**
 * Validate array of addresses
 * @param addresses - Addresses to validate
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateAddresses(addresses: string[], fieldName: string = 'Addresses'): void {
  if (!addresses || addresses.length === 0) {
    throw new Error(`${fieldName} array cannot be empty`);
  }
  
  addresses.forEach((addr, index) => {
    if (!isAddress(addr)) {
      throw new Error(`${fieldName}[${index}] is not a valid Ethereum address: ${addr}`);
    }
  });
}

// ============================================================================
// AMOUNT VALIDATION
// ============================================================================

/**
 * Validate ETH amount
 * @param amountETH - Amount in ETH as string
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateEthAmount(amountETH: string, fieldName: string = 'Amount'): void {
  if (!amountETH) {
    throw new Error(`${fieldName} is required`);
  }
  
  const amount = parseFloat(amountETH);
  
  if (isNaN(amount)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (amount <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  
  // Try parsing to ensure it's valid
  try {
    parseEther(amountETH);
  } catch (error) {
    throw new Error(`${fieldName} has invalid format: ${amountETH}`);
  }
}

/**
 * Validate bid amount (minimum 0.01 ETH)
 * @param bidAmountETH - Bid amount in ETH
 * @throws Error if invalid
 */
export function validateBidAmount(bidAmountETH: string): void {
  validateEthAmount(bidAmountETH, 'Bid amount');
  
  const amount = parseFloat(bidAmountETH);
  if (amount < 0.01) {
    throw new Error('Bid amount must be at least 0.01 ETH');
  }
}

/**
 * Validate bigint amount
 * @param amount - Amount as bigint
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateBigIntAmount(amount: bigint, fieldName: string = 'Amount'): void {
  if (amount < BigInt(0)) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  
  if (amount === BigInt(0)) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
}

// ============================================================================
// ID VALIDATION
// ============================================================================

/**
 * Validate Noun ID
 * @param nounId - Noun token ID
 * @throws Error if invalid
 */
export function validateNounId(nounId: bigint): void {
  if (nounId < BigInt(0)) {
    throw new Error('Noun ID cannot be negative');
  }
}

/**
 * Validate proposal ID
 * @param proposalId - Proposal ID
 * @throws Error if invalid
 */
export function validateProposalId(proposalId: bigint): void {
  if (proposalId < BigInt(0)) {
    throw new Error('Proposal ID cannot be negative');
  }
}

/**
 * Validate candidate ID
 * @param candidateId - Candidate ID
 * @throws Error if invalid
 */
export function validateCandidateId(candidateId: bigint): void {
  if (candidateId < BigInt(0)) {
    throw new Error('Candidate ID cannot be negative');
  }
}

/**
 * Validate stream ID
 * @param streamId - Stream ID
 * @throws Error if invalid
 */
export function validateStreamId(streamId: bigint): void {
  if (streamId < BigInt(0)) {
    throw new Error('Stream ID cannot be negative');
  }
}

/**
 * Validate client ID
 * @param clientId - Client ID
 * @throws Error if invalid
 */
export function validateClientId(clientId: number): void {
  if (clientId < 0) {
    throw new Error('Client ID cannot be negative');
  }
}

// ============================================================================
// STRING VALIDATION
// ============================================================================

/**
 * Validate non-empty string
 * @param value - String to validate
 * @param fieldName - Field name for error message
 * @param minLength - Minimum length (default: 1)
 * @throws Error if invalid
 */
export function validateString(
  value: string,
  fieldName: string,
  minLength: number = 1
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  
  if (value.trim().length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
}

/**
 * Validate proposal description
 * @param description - Proposal description
 * @throws Error if invalid
 */
export function validateProposalDescription(description: string): void {
  validateString(description, 'Proposal description', 10);
  // Note: No max length limit - on-chain proposals can be arbitrarily long
  // The contract itself doesn't impose a length limit on descriptions
}

/**
 * Validate candidate slug
 * @param slug - Candidate slug
 * @throws Error if invalid
 */
export function validateCandidateSlug(slug: string): void {
  validateString(slug, 'Candidate slug', 3);
  
  // Slug should be URL-safe
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    throw new Error('Candidate slug must contain only lowercase letters, numbers, and hyphens');
  }
  
  if (slug.length > 100) {
    throw new Error('Candidate slug is too long (max 100 characters)');
  }
}

/**
 * Validate vote reason
 * @param reason - Vote reason
 * @throws Error if invalid
 */
export function validateVoteReason(reason: string): void {
  if (reason && reason.length > 1000) {
    throw new Error('Vote reason is too long (max 1,000 characters)');
  }
}

// ============================================================================
// ARRAY VALIDATION
// ============================================================================

/**
 * Validate proposal actions arrays have matching lengths
 * @param targets - Target addresses
 * @param values - ETH values
 * @param signatures - Function signatures
 * @param calldatas - Calldata
 * @throws Error if invalid
 */
export function validateProposalActions(
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[]
): void {
  if (targets.length === 0) {
    throw new Error('Proposal must have at least one action');
  }
  
  if (targets.length > 10) {
    throw new Error('Proposal cannot have more than 10 actions');
  }
  
  const length = targets.length;
  
  if (values.length !== length) {
    throw new Error('Values array length must match targets array length');
  }
  
  if (signatures.length !== length) {
    throw new Error('Signatures array length must match targets array length');
  }
  
  if (calldatas.length !== length) {
    throw new Error('Calldatas array length must match targets array length');
  }
  
  // Validate each target address
  validateAddresses(targets, 'Target addresses');
}

/**
 * Validate token IDs array
 * @param tokenIds - Array of token IDs
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateTokenIds(tokenIds: bigint[], fieldName: string = 'Token IDs'): void {
  if (!tokenIds || tokenIds.length === 0) {
    throw new Error(`${fieldName} array cannot be empty`);
  }
  
  tokenIds.forEach((id, index) => {
    if (id < BigInt(0)) {
      throw new Error(`${fieldName}[${index}] cannot be negative`);
    }
  });
}

// ============================================================================
// VOTE SUPPORT VALIDATION
// ============================================================================

/**
 * Validate vote support value
 * @param support - Vote support (0=Against, 1=For, 2=Abstain)
 * @throws Error if invalid
 */
export function validateVoteSupport(support: number): void {
  if (![0, 1, 2].includes(support)) {
    throw new Error('Vote support must be 0 (Against), 1 (For), or 2 (Abstain)');
  }
}
