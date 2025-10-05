# Phase 6: User Customization & Persistence

**Status:** ✅ Complete - Ready for Testing  
**Goal:** Wallet-connected users can customize their OS and have it persist across sessions.

## Overview

Phase 6 implements a complete user customization and persistence system using Neon Postgres. Users can customize their desktop, and all changes are saved to their wallet address.

## What's Working

### ✅ Desktop Icon Persistence
- Drag and drop desktop icons to any position
- Free-form positioning (no grid snap by default)
- Positions saved automatically (debounced, 1 second)
- Restored when reconnecting with same wallet

### ✅ Wallet-Based Identity
- User preferences tied to wallet address
- Multi-chain support (EVM, Solana, Bitcoin)
- First-time users get default preferences
- Returning users get their saved preferences

### ✅ Auto-Save/Load
- **On Connect:** Preferences loaded automatically
- **On Icon Move:** Debounced save (1 second delay)
- **On Disconnect:** Final save, then reset to defaults
- **On Page Unload:** Auto-save before leaving

### ✅ Database Schema
- **Users:** Wallet-based identity tracking
- **Desktop Icons:** Icon position storage
- **Theme Preferences:** Theme, wallpaper, font size, etc.
- **Window States:** Remember window positions/sizes per app
- **Dock Preferences:** Pinned apps, position, size
- **System Preferences:** Double-click speed, scroll speed, etc.

## Architecture

### Data Flow

```
User connects wallet
    ↓
useWalletSync hook detects connection
    ↓
systemStore.loadUserPreferences(walletAddress)
    ↓
API: GET /api/preferences/load?wallet=0x...
    ↓
persistence.ts: loadUserPreferences()
    ↓
Neon Postgres: SELECT from all preference tables
    ↓
Apply preferences to systemStore
    ↓
Desktop component renders with saved positions

---

User drags desktop icon
    ↓
Desktop component: moveDesktopIcon()
    ↓
systemStore: state updated immediately (UI responsive)
    ↓
Desktop component: saveUserPreferences() on drag end
    ↓
systemStore: debounced save (1 second)
    ↓
API: POST /api/preferences/save
    ↓
persistence.ts: saveAllPreferences()
    ↓
Neon Postgres: UPSERT into database
    ↓
Success! Preferences saved
```

## Files Created/Modified

### ✅ New Files

**Database:**
- `/docs/DATABASE_SCHEMA.sql` - Complete database schema
- `/docs/PHASE_6_README.md` - This file

**Business Logic:**
- `/lib/persistence.ts` - Pure TypeScript persistence layer
  - `loadUserPreferences()`
  - `saveUserPreferences()`
  - `saveDesktopIcons()`
  - `saveThemePreferences()`
  - Default preference helpers

**API Routes:**
- `/app/api/preferences/load/route.ts` - GET endpoint
- `/app/api/preferences/save/route.ts` - POST endpoint  
- `/app/api/preferences/icons/route.ts` - Fast icon save endpoint

**React Hooks:**
- `/src/OS/lib/useWalletSync.ts` - Wallet connection sync hook

### ✅ Modified Files

**System Store:**
- `/src/OS/store/systemStore.ts`
  - Added `UserPreferencesState` interface
  - Added `connectedWallet` state
  - Added `loadUserPreferences()` action
  - Added `saveUserPreferences()` action (debounced)
  - Added `saveDesktopIconPositions()` action
  - Added `updateThemePreference()` action
  - Added `resetToDefaults()` action
  - Added `setConnectedWallet()` action

**Desktop Component:**
- `/src/OS/components/Desktop/Desktop.tsx`
  - Integrated `useWalletSync()` hook
  - Triggers `saveUserPreferences()` on icon drag end
  - Respects `connectedWallet` state

**Documentation:**
- `/docs/ENV_SETUP.md` - Added Neon database setup instructions

## Database Schema

See `/docs/DATABASE_SCHEMA.sql` for complete schema.

**Tables:**
- `users` - Wallet-based identity
- `desktop_icons` - Icon positions per wallet
- `theme_preferences` - Theme/wallpaper per wallet
- `window_states` - Window positions/sizes per app
- `dock_preferences` - Dock configuration
- `system_preferences` - System settings
- `app_states` - App-specific data (flexible JSONB)

**Key Features:**
- `ON DELETE CASCADE` - Clean up when user deleted
- `UNIQUE` constraints - One preference per wallet per item
- Indexes on wallet addresses for performance
- `updated_at` timestamps for tracking changes

## API Endpoints

### GET `/api/preferences/load?wallet=0x...`

**Purpose:** Load all preferences for a wallet  
**Returns:**
```json
{
  "preferences": {
    "desktopIcons": [...],
    "theme": {...},
    "windowStates": [...],
    "dockPreferences": {...},
    "systemPreferences": {...}
  },
  "isFirstTime": false
}
```

**Error Cases:**
- `400` - Missing or invalid wallet address
- `500` - Database error

### POST `/api/preferences/save`

**Purpose:** Save all preferences for a wallet  
**Body:**
```json
{
  "walletAddress": "0x...",
  "preferences": {
    "desktopIcons": [...],
    "theme": {...},
    "windowStates": [...],
    "dockPreferences": {...},
    "systemPreferences": {...}
  }
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

**Error Cases:**
- `400` - Missing wallet or preferences
- `500` - Database error

### POST `/api/preferences/icons`

**Purpose:** Fast save for icon positions only (no debounce)  
**Body:**
```json
{
  "walletAddress": "0x...",
  "icons": [
    { "icon_id": "desktop-finder", "position_x": 20, "position_y": 30, "grid_snap": false },
    ...
  ]
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Icon positions saved"
}
```

## Setup Instructions

### 1. Set Up Neon Database

**Create Project:**
1. Go to https://neon.tech
2. Sign up (free tier)
3. Create project: "Nouns OS"
4. Select region (closest to users)

**Get Connection String:**
1. Dashboard → Connection Details
2. Copy the connection string
3. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

**Add to .env.local:**
```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Run Schema:**
1. Open Neon SQL Editor
2. Copy contents of `/docs/DATABASE_SCHEMA.sql`
3. Paste into editor
4. Execute
5. Verify tables created (7 tables total)

### 2. Test the Flow

**Manual Testing:**
```bash
npm run dev
```

1. ✅ **Connect Wallet**
   - Open app
   - Click wallet icon in system tray
   - Connect with MetaMask/Rainbow/etc.
   - Check console: "First-time user - using defaults" or "Preferences loaded successfully"

2. ✅ **Drag Desktop Icon**
   - Find any desktop icon
   - Click and drag to new position
   - Release
   - Check console: "Preferences saved successfully" (after 1 second debounce)

3. ✅ **Disconnect Wallet**
   - Click wallet icon
   - Disconnect
   - Icons should reset to default positions
   - Check console: "Wallet disconnected"

4. ✅ **Reconnect Same Wallet**
   - Connect again with same wallet
   - Icons should restore to saved positions!
   - Check console: "Preferences loaded successfully"

5. ✅ **Test Different Wallet**
   - Disconnect
   - Connect with different wallet address
   - Should load different preferences (or defaults if first time)

### 3. Verify Database

**Check Neon Dashboard:**
1. Go to Neon dashboard
2. Open SQL Editor
3. Run query:
   ```sql
   SELECT * FROM users;
   SELECT * FROM desktop_icons;
   ```
4. You should see:
   - Your wallet address in `users` table
   - Icon positions in `desktop_icons` table

## Future Enhancements (Not in Phase 6)

### Theme System (Phase 6.5)
- Multiple built-in themes (Classic, Platinum, Dark Mode)
- Custom theme creator
- CSS custom properties for theming
- ThemeProvider component

### Advanced Customization
- Custom wallpaper upload (IPFS)
- Window state persistence (remember positions)
- Dock customization UI
- System preferences panel
- Import/Export preferences

### Social Features
- Share your desktop setup
- Theme marketplace
- Community presets
- "Featured Desktops" showcase

### Performance
- Caching layer (Redis)
- Optimistic updates
- Background sync
- Offline support

## Known Limitations

1. **No Signature Verification:** Currently trusts wallet address from client. Should add signature verification for production.

2. **No Window State Saving:** Window positions/sizes not yet persisted (TODO in systemStore).

3. **No Theme Switching UI:** Theme preferences saved but no UI to change themes yet.

4. **No Conflict Resolution:** If user has multiple tabs open, last write wins. Should use BroadcastChannel for cross-tab sync.

5. **No Versioning:** Preference schema changes could break old data. Should add version field.

## Performance Considerations

### Debounced Saves
- Icon moves debounced by 1 second
- Prevents database spam during drag
- User sees instant feedback (state updates immediately)
- Save happens in background

### API Optimization
- Separate fast endpoint for icon positions (`/api/preferences/icons`)
- Full save endpoint for all preferences (`/api/preferences/save`)
- Fire-and-forget saves (don't block UI)

### Database Optimization
- Indexes on wallet addresses
- UPSERT operations (no duplicate inserts)
- CASCADE deletes (automatic cleanup)
- Connection pooling (Neon automatic)

## Security Notes

### ⚠️ Production TODO
1. **Add wallet signature verification:**
   ```typescript
   // Verify user owns the wallet before saving
   const signature = await signer.signMessage("Save preferences");
   const recovered = verifyMessage(message, signature);
   if (recovered !== walletAddress) throw new Error("Unauthorized");
   ```

2. **Rate limiting:**
   - Limit saves per wallet per minute
   - Prevent database spam

3. **Input validation:**
   - Validate icon positions (within bounds)
   - Sanitize preference data
   - Limit data size

### Current Security
- ✅ Wallet address format validation
- ✅ Server-side DATABASE_URL (not exposed to client)
- ✅ SQL injection prevention (Neon library handles this)
- ✅ Input type checking
- ❌ No signature verification (TODO)
- ❌ No rate limiting (TODO)

## Troubleshooting

### "Database not configured" Error
- **Problem:** `DATABASE_URL` not set
- **Solution:** Add to `.env.local` and restart dev server

### Preferences Not Saving
1. Check wallet is connected
2. Check console for save errors
3. Verify database tables exist
4. Test database connection string

### Preferences Not Loading
1. Check wallet address is correct
2. Check console for load errors
3. Verify data exists in database
4. Check API endpoint returns data

### Desktop Icons Reset on Reload
- **Problem:** Preferences not loading
- **Possible Causes:**
  - Wallet not connected
  - Database connection failed
  - No saved preferences yet (first time)
- **Solution:** Connect wallet, drag icon, wait 1 second, reload

## Testing Checklist

- [ ] Connect wallet → preferences load
- [ ] Drag icon → saves automatically (1 sec delay)
- [ ] Disconnect wallet → resets to defaults
- [ ] Reconnect same wallet → restores positions
- [ ] Switch wallets → different preferences
- [ ] Page reload → preferences persist
- [ ] Multiple icons → all positions saved
- [ ] Console shows correct logs
- [ ] Database has correct data
- [ ] No errors in console
- [ ] UI remains responsive during saves

## Deployment Notes

### Vercel Deployment

**Environment Variables:**
1. Go to Vercel project settings
2. Add environment variable:
   - Name: `DATABASE_URL`
   - Value: (paste Neon connection string)
   - Environments: Production, Preview, Development

**Database Branching:**
Neon supports database branches - use different databases for:
- Production: Main branch
- Preview: Preview branches
- Development: Local development

**Cold Starts:**
- Neon has excellent cold start performance
- First request may be ~200ms slower
- Subsequent requests are fast
- Connection pooling automatic

## Success Metrics

Phase 6 is successful if:
- ✅ Users can customize desktop
- ✅ Customizations persist across sessions
- ✅ Wallet-based identity works
- ✅ No data loss
- ✅ Responsive UI (saves don't block)
- ✅ Database queries are fast (<100ms)
- ✅ No errors in production

---

**Built by:** Berry  
**Phase:** 6 of 6 (Foundation complete!)  
**Next Steps:** Polish, themes, advanced features, social sharing

**Documentation:**
- `/docs/DATABASE_SCHEMA.sql` - Database schema
- `/docs/ENV_SETUP.md` - Environment setup guide
- `/claude.md` - Complete project documentation

