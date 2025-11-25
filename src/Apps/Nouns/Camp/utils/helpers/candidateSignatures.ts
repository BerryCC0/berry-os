/**
 * Candidate Signatures Utilities
 * Pure TypeScript business logic for handling candidate signatures
 */

import type { CandidateSignature } from '../types/camp';

/**
 * Filter out invalid signatures (reason: 'Invalid signature', expired, etc.)
 */
export function getValidSignatures(signatures: CandidateSignature[]): CandidateSignature[] {
  return signatures.filter(sig => {
    // Filter out signatures with invalid reasons
    if (sig.reason && sig.reason.toLowerCase().includes('invalid')) {
      return false;
    }
    
    // TODO: Check expiration if candidates have expiration timestamps
    // if (sig.expirationTimestamp && sig.expirationTimestamp < Date.now()) {
    //   return false;
    // }
    
    return true;
  });
}

/**
 * Calculate total voting power from signatures
 * Note: Currently returns signature count since votes aren't tracked per signature
 * TODO: Enhance when vote tracking is added to CandidateSignature type
 */
export function calculateTotalVotingPower(signatures: CandidateSignature[]): number {
  return signatures.length;
}

/**
 * Format signature for contract call
 * The contract expects ProposerSignature format with proper types
 */
export function formatSignatureForContract(signature: CandidateSignature): {
  sig: `0x${string}`;
  signer: `0x${string}`;
  expirationTimestamp: bigint;
} {
  return {
    sig: signature.sig as `0x${string}`,
    signer: signature.signer as `0x${string}`,
    expirationTimestamp: BigInt(signature.expirationTimestamp || 0),
  };
}

/**
 * Get the most recent signature from an address
 */
export function getMostRecentSignature(
  signatures: CandidateSignature[],
  signerAddress: string
): CandidateSignature | undefined {
  const signerSigs = signatures.filter(
    sig => sig.signer.toLowerCase() === signerAddress.toLowerCase()
  );
  
  if (signerSigs.length === 0) return undefined;
  
  // Sort by timestamp descending
  return signerSigs.sort((a, b) => 
    (b.createdTimestamp || 0) - (a.createdTimestamp || 0)
  )[0];
}

/**
 * Check if an address has already signed
 */
export function hasUserSigned(
  signatures: CandidateSignature[],
  userAddress: string
): boolean {
  return signatures.some(
    sig => sig.signer.toLowerCase() === userAddress.toLowerCase()
  );
}
