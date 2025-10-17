-- Migration: Add template state support to proposal drafts
-- This enables storing template IDs and field values for re-editing
-- Adds draft_title for user-facing draft names separate from proposal titles

-- Add new columns
ALTER TABLE proposal_drafts 
  ADD COLUMN IF NOT EXISTS draft_title VARCHAR(200),
  ADD COLUMN IF NOT EXISTS action_templates JSONB DEFAULT '[]';

-- Rename draft_name to draft_slug (internal identifier)
ALTER TABLE proposal_drafts 
  RENAME COLUMN draft_name TO draft_slug;

-- Update constraint to use new column name
ALTER TABLE proposal_drafts 
  DROP CONSTRAINT IF EXISTS proposal_drafts_wallet_address_draft_name_key;

ALTER TABLE proposal_drafts 
  ADD CONSTRAINT proposal_drafts_wallet_address_draft_slug_key 
  UNIQUE(wallet_address, draft_slug);

-- Update comments
COMMENT ON COLUMN proposal_drafts.draft_slug IS 'Auto-generated internal identifier (slug) for the draft';
COMMENT ON COLUMN proposal_drafts.draft_title IS 'User-editable draft name (separate from proposal title)';
COMMENT ON COLUMN proposal_drafts.action_templates IS 'JSON array of template states [{templateId, fieldValues, generatedActions}] for re-editing';

-- Backfill draft_title from title for existing drafts
UPDATE proposal_drafts 
SET draft_title = title 
WHERE draft_title IS NULL;

-- Backfill action_templates from actions for existing drafts (as 'custom' templates)
UPDATE proposal_drafts 
SET action_templates = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'templateId', 'custom',
      'fieldValues', '{}'::jsonb,
      'generatedActions', jsonb_build_array(action)
    )
  )
  FROM jsonb_array_elements(actions) AS action
)
WHERE action_templates = '[]'::jsonb AND actions != '[]'::jsonb;

-- Make draft_title NOT NULL after backfilling
ALTER TABLE proposal_drafts 
  ALTER COLUMN draft_title SET NOT NULL;

