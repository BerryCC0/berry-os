# Smart Proposal Drafts System

## Overview

The Smart Proposal Drafts system transforms the Nouns proposal creation experience into a Google Docs/HackMD-style unified interface with intelligent state management and seamless autosave.

## Key Features

### 1. Template State Preservation
- **Before**: Only raw action data (target, value, signature, calldata) was saved
- **After**: Full template state including template ID and field values is preserved
- **Benefit**: Users can resume editing exactly where they left off with the template UI intact

### 2. Dual Naming System
- **Draft Title**: User-editable name for the draft document (e.g., "My Treasury Proposal")
- **Proposal Title**: The actual on-chain proposal title  
- **Benefit**: Clear separation like Google Docs (document name vs. content)

### 3. Intelligent Autosave
- **Frequency**: Every 5 seconds (increased from 2 seconds)
- **Auto-naming**: First keystroke in proposal title generates draft name
- **Status Indicators**: 
  - 💾 Saving...
  - ✓ Saved 3m ago
  - ● Unsaved changes
  - ⚠️ Save failed

### 4. Inline Draft Renaming
- Click the ✏️ button next to any draft name
- Edit inline with Enter to save, Escape to cancel
- Instant update across UI

### 5. Rich Draft Metadata Display
- Draft title (primary, user-facing name)
- Proposal title (secondary, what goes on-chain)
- Relative timestamps (3m ago, 2h ago, etc.)
- Proposal type badge (Standard/Candidate/TimelockV1)
- KYC status indicator

## Database Schema Changes

### New Columns
```sql
-- draft_slug: Internal identifier (auto-generated, not shown to user)
ALTER TABLE proposal_drafts RENAME COLUMN draft_name TO draft_slug;

-- draft_title: User-editable draft name
ALTER TABLE proposal_drafts ADD COLUMN draft_title VARCHAR(200) NOT NULL;

-- action_templates: Full template state for re-editing
ALTER TABLE proposal_drafts ADD COLUMN action_templates JSONB DEFAULT '[]';
```

### Schema Structure
```typescript
interface ProposalDraft {
  id?: number;
  wallet_address: string;
  draft_slug: string;           // Internal ID: "my-proposal-1234567890"
  draft_title: string;           // User name: "My Proposal Draft"
  title: string;                 // Proposal title: "Fund Berry Team"
  description: string;           // Markdown content
  actions: ProposalAction[];     // Flattened for submission
  action_templates: ActionTemplateState[];  // For re-editing
  proposal_type: 'standard' | 'timelock_v1' | 'candidate';
  kyc_verified: boolean;
  kyc_inquiry_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ActionTemplateState {
  templateId: ActionTemplateType | 'custom';
  fieldValues: TemplateFieldValues;
  generatedActions: ProposalAction[];
}
```

## Migration

### Run Migration Script
```bash
node scripts/migrate-drafts-to-template-state.js
```

### What It Does
1. Adds `draft_title` and `action_templates` columns
2. Renames `draft_name` to `draft_slug`  
3. Converts existing actions to `custom` template states
4. Updates constraints and comments

### Backwards Compatibility
Old drafts without `action_templates` are automatically converted to custom templates on load.

## API Changes

### New Endpoint
```typescript
PATCH /api/proposals/drafts/rename
Body: { wallet_address, draft_slug, new_title }
```

### Updated Endpoints
```typescript
// Now uses draft_slug instead of draft_name
DELETE /api/proposals/drafts/delete?wallet={wallet}&slug={slug}

// Now accepts action_templates and draft_title
POST /api/proposals/drafts/save
Body: { 
  wallet_address, 
  draft_slug,      // NEW
  draft_title,     // NEW
  title, 
  description, 
  actions,         // Flattened from templates
  action_templates // NEW
}
```

## Component Changes

### CreateProposalTab
**State Management**:
- `draftSlug`: Internal identifier
- `draftTitle`: User-facing draft name  
- `actionTemplateStates`: Array of template states (replaces `actions`)

**New Features**:
- Header shows draft name, proposal title, and save status
- Auto-generates draft title from proposal title
- Flattens template states to actions for submission

### ActionTemplateEditor
**Props Changed**:
```typescript
// Before
interface ActionTemplateEditorProps {
  index: number;
  action: ProposalAction;
  onUpdate: (field: string, value: string) => void;
  onActionsGenerated?: (actions: ProposalAction[]) => void;
  disabled?: boolean;
}

// After
interface ActionTemplateEditorProps {
  index: number;
  templateState: ActionTemplateState;  // Full state
  onUpdateTemplateState: (state: ActionTemplateState) => void;
  disabled?: boolean;
}
```

**Behavior**:
- Initializes from saved template state on mount
- Restores field values and template selection
- Updates parent with full template state on changes

### DraftSelector
**New Features**:
- Inline rename with ✏️ button
- Shows both draft title and proposal title
- Relative timestamps (3m ago, 2h ago)
- Current draft highlighting

**Props Added**:
```typescript
interface DraftSelectorProps {
  drafts: ProposalDraft[];
  currentDraft: ProposalDraft | null;  // NEW: full object
  onLoad: (draft: ProposalDraft) => void;
  onDelete: (draftSlug: string) => void;
  onRename: (draftSlug: string, newTitle: string) => void;  // NEW
  onNew: () => void;
  disabled?: boolean;
}
```

## User Experience Flow

### Creating a Draft
1. User opens Create Proposal tab
2. Starts typing proposal title
3. System auto-generates draft title: "Proposal: [title]..."
4. Auto-saves after 5 seconds
5. Draft appears in selector with generated name

### Editing a Draft
1. User selects draft from dropdown
2. All fields populate including template states
3. Template UI shows with original field values
4. Changes auto-save every 5 seconds
5. Status indicator shows save state

### Renaming a Draft
1. User clicks ✏️ button next to draft name
2. Input field appears inline
3. Type new name, press Enter
4. Name updates immediately

### Visual Feedback
```
Draft: "My Treasury Proposal" • Proposal: "Fund Berry Team" • ✓ Saved 3m ago
```

## Testing Checklist

- [x] Create new draft → autosaves with generated title
- [x] Edit draft title → renames successfully
- [x] Switch drafts → template state restores correctly
- [x] Multi-action templates → field values restore
- [x] Close tab, reopen → state persists
- [x] Autosave indicator → updates correctly
- [x] Delete draft → removes from list
- [x] Old drafts → convert to custom templates on load

## Benefits

### For Users
- **Familiar**: Feels like Google Docs/HackMD
- **Reliable**: Never lose work with smart autosave
- **Organized**: Clear draft names separate from proposal content
- **Flexible**: Edit template fields after saving

### For Developers
- **Type-safe**: Full TypeScript throughout
- **Maintainable**: Separation of concerns (state vs. presentation)
- **Extensible**: Easy to add new template types
- **Backwards compatible**: Old drafts work seamlessly

## Performance

- **Autosave**: Debounced 5 seconds to reduce DB writes
- **Template State**: Minimal overhead (~1-2KB per action)
- **Database**: JSONB indexing for fast queries
- **UI**: No re-renders during autosave

## Future Enhancements

1. **Collaborative Editing**: Multiple users on same draft (via WebSocket)
2. **Version History**: See previous versions of drafts
3. **Draft Templates**: Save draft as reusable template
4. **Rich Previews**: Show proposal preview in draft selector
5. **Draft Sharing**: Share draft link with read-only access

## Related Files

### Core
- `app/lib/Persistence/proposalDrafts.ts` - Data layer
- `src/Apps/Nouns/Camp/components/CreateProposalTab/CreateProposalTab.tsx` - Main component
- `src/Apps/Nouns/Camp/components/CreateProposalTab/components/ActionTemplateEditor.tsx` - Template editor
- `src/Apps/Nouns/Camp/components/CreateProposalTab/components/DraftSelector.tsx` - Draft picker

### API
- `app/api/proposals/drafts/save/route.ts` - Save endpoint
- `app/api/proposals/drafts/load/route.ts` - Load endpoint
- `app/api/proposals/drafts/delete/route.ts` - Delete endpoint
- `app/api/proposals/drafts/rename/route.ts` - Rename endpoint (NEW)

### Database
- `docs/migrations/add-draft-template-state.sql` - Schema migration
- `scripts/migrate-drafts-to-template-state.js` - Data migration

## Support

For issues or questions:
1. Check existing draft data in database
2. Verify migration ran successfully
3. Test with fresh draft (no cached state)
4. Check browser console for errors

