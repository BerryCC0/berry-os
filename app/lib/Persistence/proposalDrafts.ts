/**
 * Proposal Drafts Persistence Layer - Pure TypeScript Business Logic
 * Handles loading/saving proposal drafts from Neon Postgres
 * 
 * NO React dependencies - just pure TypeScript functions
 */

import { neon } from '@neondatabase/serverless';
import type { ActionTemplateType } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';

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

export interface TemplateFieldValues {
  [key: string]: string | undefined;
}

export interface ActionTemplateState {
  templateId: ActionTemplateType | 'custom';
  fieldValues: TemplateFieldValues;
  generatedActions: ProposalAction[];
}

export interface ProposalDraft {
  id?: number;
  wallet_address: string;
  draft_slug: string; // Internal identifier (auto-generated)
  draft_title: string; // User-editable draft name
  title: string; // Proposal title (what goes on-chain)
  description: string;
  actions: ProposalAction[]; // Flattened actions for submission
  action_templates: ActionTemplateState[]; // Template states for re-editing
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
      wallet_address, draft_slug, draft_title, title, description, 
      actions, action_templates, proposal_type, kyc_verified, kyc_inquiry_id, updated_at
    ) VALUES (
      ${draft.wallet_address}, 
      ${draft.draft_slug}, 
      ${draft.draft_title},
      ${draft.title}, 
      ${draft.description}, 
      ${JSON.stringify(draft.actions)},
      ${JSON.stringify(draft.action_templates)},
      ${draft.proposal_type}, 
      ${draft.kyc_verified}, 
      ${draft.kyc_inquiry_id || null},
      NOW()
    )
    ON CONFLICT (wallet_address, draft_slug)
    DO UPDATE SET 
      draft_title = ${draft.draft_title},
      title = ${draft.title},
      description = ${draft.description},
      actions = ${JSON.stringify(draft.actions)},
      action_templates = ${JSON.stringify(draft.action_templates)},
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
    draft_slug: row.draft_slug as string,
    draft_title: row.draft_title as string,
    title: row.title as string,
    description: row.description as string,
    actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions,
    action_templates: typeof row.action_templates === 'string' ? JSON.parse(row.action_templates) : row.action_templates,
    proposal_type: row.proposal_type as 'standard' | 'timelock_v1' | 'candidate',
    kyc_verified: row.kyc_verified as boolean,
    kyc_inquiry_id: row.kyc_inquiry_id as string | undefined,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  })) as ProposalDraft[];
}

/**
 * Load a single draft by slug
 * 
 * @param walletAddress - Wallet address
 * @param draftSlug - Draft slug (internal identifier)
 * @returns Draft or null if not found
 */
export async function loadDraft(
  walletAddress: string, 
  draftSlug: string
): Promise<ProposalDraft | null> {
  if (!sql) throw new Error('Database not configured');
  
  const results = await sql`
    SELECT * FROM proposal_drafts
    WHERE wallet_address = ${walletAddress} AND draft_slug = ${draftSlug}
    LIMIT 1
  `;
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id as number,
    wallet_address: row.wallet_address as string,
    draft_slug: row.draft_slug as string,
    draft_title: row.draft_title as string,
    title: row.title as string,
    description: row.description as string,
    actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions,
    action_templates: typeof row.action_templates === 'string' ? JSON.parse(row.action_templates) : row.action_templates,
    proposal_type: row.proposal_type as 'standard' | 'timelock_v1' | 'candidate',
    kyc_verified: row.kyc_verified as boolean,
    kyc_inquiry_id: row.kyc_inquiry_id as string | undefined,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  } as ProposalDraft;
}

/**
 * Delete a draft
 * 
 * @param walletAddress - Wallet address
 * @param draftSlug - Draft slug to delete
 */
export async function deleteDraft(
  walletAddress: string, 
  draftSlug: string
): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    DELETE FROM proposal_drafts
    WHERE wallet_address = ${walletAddress} AND draft_slug = ${draftSlug}
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
 * @param draftSlug - Draft slug
 * @param kycVerified - KYC verification status
 * @param kycInquiryId - Persona inquiry ID
 */
export async function updateDraftKYC(
  walletAddress: string,
  draftSlug: string,
  kycVerified: boolean,
  kycInquiryId?: string
): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    UPDATE proposal_drafts
    SET kyc_verified = ${kycVerified},
        kyc_inquiry_id = ${kycInquiryId || null},
        updated_at = NOW()
    WHERE wallet_address = ${walletAddress} AND draft_slug = ${draftSlug}
  `;
}

/**
 * Update draft title (rename draft)
 * 
 * @param walletAddress - Wallet address
 * @param draftSlug - Draft slug
 * @param newTitle - New draft title
 */
export async function updateDraftTitle(
  walletAddress: string,
  draftSlug: string,
  newTitle: string
): Promise<void> {
  if (!sql) throw new Error('Database not configured');
  
  await sql`
    UPDATE proposal_drafts
    SET draft_title = ${newTitle},
        updated_at = NOW()
    WHERE wallet_address = ${walletAddress} AND draft_slug = ${draftSlug}
  `;
}

/**
 * Generate a URL-safe slug from a string
 * 
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

/**
 * Generate a unique slug by appending timestamp if needed
 * 
 * @param baseSlug - Base slug
 * @returns Unique slug
 */
export function generateUniqueSlug(baseSlug: string): string {
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}

