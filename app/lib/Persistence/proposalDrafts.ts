/**
 * Proposal Drafts Persistence Layer - Pure TypeScript Business Logic
 * Handles loading/saving proposal drafts from Neon Postgres
 * 
 * NO React dependencies - just pure TypeScript functions
 */

import { neon } from '@neondatabase/serverless';

// Only run on server-side
const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL) 
  : null;

// ==================== Types ====================

export interface ProposalAction {
  target: string;
  value: string;
  signature: string;
  calldata: string;
  // Multi-action metadata
  isPartOfMultiAction?: boolean;
  multiActionGroupId?: string;
  multiActionIndex?: number;
}

export interface ProposalDraft {
  id?: number;
  wallet_address: string;
  draft_name: string;
  title: string;
  description: string;
  actions: ProposalAction[];
  proposal_type: 'standard' | 'timelock_v1' | 'candidate';
  candidate_slug?: string; // Auto-generated from title for candidates
  kyc_verified: boolean;
  kyc_inquiry_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ==================== Draft Management ====================

/**
 * Save or update a proposal draft
 * Uses upsert to create new or update existing draft
 * 
 * @param draft - Draft to save
 * @returns Draft ID
 */
export async function saveDraft(draft: ProposalDraft): Promise<number> {
  if (!sql) throw new Error('Database not configured');
  
  const result = await sql`
    INSERT INTO proposal_drafts (
      wallet_address, draft_name, title, description, actions, 
      proposal_type, kyc_verified, kyc_inquiry_id, updated_at
    ) VALUES (
      ${draft.wallet_address}, 
      ${draft.draft_name}, 
      ${draft.title}, 
      ${draft.description}, 
      ${JSON.stringify(draft.actions)}, 
      ${draft.proposal_type}, 
      ${draft.kyc_verified}, 
      ${draft.kyc_inquiry_id || null},
      NOW()
    )
    ON CONFLICT (wallet_address, draft_name)
    DO UPDATE SET 
      title = ${draft.title},
      description = ${draft.description},
      actions = ${JSON.stringify(draft.actions)},
      proposal_type = ${draft.proposal_type},
      kyc_verified = ${draft.kyc_verified},
      kyc_inquiry_id = ${draft.kyc_inquiry_id || null},
      updated_at = NOW()
    RETURNING id
  `;
  
  return result[0].id;
}

/**
 * Load all drafts for a wallet address
 * Sorted by most recently updated
 * 
 * @param walletAddress - Wallet address
 * @returns Array of drafts
 */
export async function loadDrafts(walletAddress: string): Promise<ProposalDraft[]> {
  if (!sql) throw new Error('Database not configured');
  
  const results = await sql`
    SELECT * FROM proposal_drafts
    WHERE wallet_address = ${walletAddress}
    ORDER BY updated_at DESC
  `;
  
  return results.map(row => ({
    id: row.id as number,
    wallet_address: row.wallet_address as string,
    draft_name: row.draft_name as string,
    title: row.title as string,
    description: row.description as string,
    actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  })) as ProposalDraft[];
}

/**
 * Load a single draft by name
 * 
 * @param walletAddress - Wallet address
 * @param draftName - Draft name
 * @returns Draft or null if not found
 */
export async function loadDraft(
  walletAddress: string, 
  draftName: string
): Promise<ProposalDraft | null> {
  if (!sql) throw new Error('Database not configured');
  
  const results = await sql`
    SELECT * FROM proposal_drafts
    WHERE wallet_address = ${walletAddress} AND draft_name = ${draftName}
    LIMIT 1
  `;
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id as number,
    wallet_address: row.wallet_address as string,
    draft_name: row.draft_name as string,
    title: row.title as string,
    description: row.description as string,
    actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  } as ProposalDraft;
}

/**
 * Delete a draft
 * 
 * @param walletAddress - Wallet address
 * @param draftName - Draft name to delete
 */
export async function deleteDraft(
  walletAddress: string, 
  draftName: string
): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    DELETE FROM proposal_drafts
    WHERE wallet_address = ${walletAddress} AND draft_name = ${draftName}
  `;
}

/**
 * Delete all drafts for a wallet (useful for cleanup)
 * 
 * @param walletAddress - Wallet address
 */
export async function deleteAllDrafts(walletAddress: string): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    DELETE FROM proposal_drafts
    WHERE wallet_address = ${walletAddress}
  `;
}

/**
 * Update KYC status for a draft
 * 
 * @param walletAddress - Wallet address
 * @param draftName - Draft name
 * @param kycVerified - KYC verification status
 * @param kycInquiryId - Persona inquiry ID
 */
export async function updateDraftKYC(
  walletAddress: string,
  draftName: string,
  kycVerified: boolean,
  kycInquiryId?: string
): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    UPDATE proposal_drafts
    SET kyc_verified = ${kycVerified},
        kyc_inquiry_id = ${kycInquiryId || null},
        updated_at = NOW()
    WHERE wallet_address = ${walletAddress} AND draft_name = ${draftName}
  `;
}

