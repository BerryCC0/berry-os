/**
 * Neynar SDK - Signer Utilities
 * 
 * Pure business logic for handling Farcaster signers.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/signer
 */

import type {
  Signer,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a signer UUID format
 * 
 * @param uuid - Signer UUID to validate
 * @returns True if valid UUID format
 * 
 * @example
 * ```typescript
 * isValidSignerUuid('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidSignerUuid('invalid') // false
 * ```
 */
export function isValidSignerUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates a public key format (0x prefixed hex)
 * 
 * @param publicKey - Public key to validate
 * @returns True if valid format
 * 
 * @example
 * ```typescript
 * isValidPublicKey('0x1234...') // true
 * isValidPublicKey('invalid') // false
 * ```
 */
export function isValidPublicKey(publicKey: string): boolean {
  return /^0x[a-fA-F0-9]{64,}$/.test(publicKey);
}

// ============================================================================
// Signer Status
// ============================================================================

/**
 * Checks if signer is approved
 * 
 * @param signer - Signer object
 * @returns True if approved
 * 
 * @example
 * ```typescript
 * isApproved(signer) // true
 * ```
 */
export function isApproved(signer: Signer): boolean {
  return signer.status === 'approved';
}

/**
 * Checks if signer is pending approval
 * 
 * @param signer - Signer object
 * @returns True if pending
 * 
 * @example
 * ```typescript
 * isPending(signer) // false
 * ```
 */
export function isPending(signer: Signer): boolean {
  return signer.status === 'pending_approval';
}

/**
 * Checks if signer is revoked
 * 
 * @param signer - Signer object
 * @returns True if revoked
 * 
 * @example
 * ```typescript
 * isRevoked(signer) // false
 * ```
 */
export function isRevoked(signer: Signer): boolean {
  return signer.status === 'revoked';
}

/**
 * Gets signer status label
 * 
 * @param status - Signer status
 * @returns Display label
 * 
 * @example
 * ```typescript
 * getStatusLabel('approved') // 'Approved'
 * getStatusLabel('pending_approval') // 'Pending'
 * ```
 */
export function getStatusLabel(
  status: 'approved' | 'pending_approval' | 'revoked'
): string {
  const labels = {
    approved: 'Approved',
    pending_approval: 'Pending',
    revoked: 'Revoked',
  };
  return labels[status];
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters approved signers
 * 
 * @param signers - Signers to filter
 * @returns Approved signers
 * 
 * @example
 * ```typescript
 * const approved = filterApproved(signers)
 * ```
 */
export function filterApproved(signers: Signer[]): Signer[] {
  return signers.filter(s => isApproved(s));
}

/**
 * Filters pending signers
 * 
 * @param signers - Signers to filter
 * @returns Pending signers
 * 
 * @example
 * ```typescript
 * const pending = filterPending(signers)
 * ```
 */
export function filterPending(signers: Signer[]): Signer[] {
  return signers.filter(s => isPending(s));
}

/**
 * Filters revoked signers
 * 
 * @param signers - Signers to filter
 * @returns Revoked signers
 * 
 * @example
 * ```typescript
 * const revoked = filterRevoked(signers)
 * ```
 */
export function filterRevoked(signers: Signer[]): Signer[] {
  return signers.filter(s => isRevoked(s));
}

/**
 * Filters signers by FID
 * 
 * @param signers - Signers to filter
 * @param fid - User FID
 * @returns Filtered signers
 * 
 * @example
 * ```typescript
 * const userSigners = filterByFid(signers, 3621)
 * ```
 */
export function filterByFid(signers: Signer[], fid: number): Signer[] {
  return signers.filter(s => s.fid === fid);
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts signers by UUID (alphabetically)
 * 
 * @param signers - Signers to sort
 * @returns Sorted signers
 * 
 * @example
 * ```typescript
 * const sorted = sortByUuid(signers)
 * ```
 */
export function sortByUuid(signers: Signer[]): Signer[] {
  return [...signers].sort((a, b) => 
    a.signerUuid.localeCompare(b.signerUuid)
  );
}

// ============================================================================
// Lookup
// ============================================================================

/**
 * Finds signer by UUID
 * 
 * @param signers - Signers to search
 * @param uuid - Signer UUID
 * @returns Signer or null
 * 
 * @example
 * ```typescript
 * const signer = findByUuid(signers, 'abc-123')
 * ```
 */
export function findByUuid(signers: Signer[], uuid: string): Signer | null {
  return signers.find(s => s.signerUuid === uuid) || null;
}

/**
 * Finds signer by public key
 * 
 * @param signers - Signers to search
 * @param publicKey - Public key
 * @returns Signer or null
 * 
 * @example
 * ```typescript
 * const signer = findByPublicKey(signers, '0x1234...')
 * ```
 */
export function findByPublicKey(signers: Signer[], publicKey: string): Signer | null {
  return signers.find(s => s.publicKey === publicKey) || null;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats public key for display (truncated)
 * 
 * @param publicKey - Public key to format
 * @param length - Number of characters to show on each end
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatPublicKey('0x1234567890abcdef', 4)
 * // '0x1234...cdef'
 * ```
 */
export function formatPublicKey(publicKey: string, length: number = 4): string {
  if (publicKey.length <= length * 2 + 2) {
    return publicKey;
  }
  
  const start = publicKey.slice(0, length + 2); // +2 for '0x'
  const end = publicKey.slice(-length);
  return `${start}...${end}`;
}

/**
 * Gets signer summary text
 * 
 * @param signer - Signer object
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getSignerSummary(signer)
 * // 'Approved • 0x1234...cdef'
 * ```
 */
export function getSignerSummary(signer: Signer): string {
  const status = getStatusLabel(signer.status);
  const key = formatPublicKey(signer.publicKey || '');
  return `${status} • ${key}`;
}

