# Theme & System Preferences - Testing Guide

Quick reference for testing that all settings work and persist correctly.

## Quick Setup

### 1. Run Migration (If Using Existing Database)

```bash
# From project root
node scripts/migrate-theme-preferences.js
```

Expected output:
```
🔄 Starting migration: Adding theme customization columns...
✅ Added column: title_bar_style
✅ Added column: window_opacity
✅ Added column: corner_style
✅ Added column: menu_bar_style
✅ Migration completed successfully!
```

### 2. Start Development Server

```bash
npm run dev
```

---

## Testing Procedure

### Phase 1: Visual Changes (Without Wallet)

**Goal:** Verify all settings change the UI immediately

1. Open Berry OS in browser
2. Open System Preferences (⚙️ icon on desktop or Apple menu)
3. Go through each setting and verify visual changes:

| Setting | Expected Visual Change | How to Verify |
|---------|----------------------|---------------|
| **Theme** | Entire UI color scheme changes | Look at windows, menus, desktop |
| **Accent Color** | Highlight colors change | Look at selected items, buttons |
| **Wallpaper** | Desktop background changes | Look at desktop behind windows |
| **Title Bar Style** | Window title bars change pattern | Open a window, look at top bar |
| **Window Opacity** | Windows become transparent | Drag slider, watch preview window |
| **Corner Style** | Window corners sharp/rounded | Look at window edges |
| **Menu Bar Style** | Menu bar solid/transparent | Look at top menu bar |
| **Font Size** | Text gets smaller/larger | Look at all text in UI |

✅ **Pass Criteria:** All settings change the UI immediately without page refresh

---

### Phase 2: Persistence (With Wallet Connected)

**Goal:** Verify settings save to database and restore correctly

#### Test A: Refresh Persistence

1. **Connect wallet** (click wallet icon in menu bar)
2. **Open System Preferences**
3. **Change multiple settings:**
   - Select "Dark Mode" theme
   - Choose "Nouns Red" accent color
   - Select "Gradient" title bar style
   - Set window opacity to 95%
   - Choose "Rounded" corners
   - Select "Large" font size
4. **Wait 2 seconds** (for debounced save)
5. **Check browser console:**
   - Should see: `"Preferences saved successfully"`
6. **Refresh the page** (⌘R or F5)
7. **Verify:**
   - ✅ Theme is still Dark Mode
   - ✅ Accent color is still Nouns Red
   - ✅ Title bars are still gradient style
   - ✅ Windows are still 95% opacity
   - ✅ Corners are still rounded
   - ✅ Font is still large

#### Test B: Disconnect/Reconnect Persistence

1. **With settings changed (from Test A)**
2. **Disconnect wallet** (click wallet icon → Disconnect)
3. **Verify:**
   - ✅ Settings reset to defaults (Classic theme, etc.)
4. **Reconnect same wallet**
5. **Wait for preferences to load** (watch console: `"Preferences loaded successfully"`)
6. **Verify:**
   - ✅ Dark Mode theme restored
   - ✅ Nouns Red accent restored
   - ✅ All customizations restored

#### Test C: Multiple Wallets

1. **Connected with Wallet A** (with Dark Mode theme)
2. **Disconnect**
3. **Connect with Wallet B** (different wallet)
4. **Change to Classic theme** and different settings
5. **Wait for save**
6. **Disconnect Wallet B**
7. **Reconnect Wallet A**
8. **Verify:**
   - ✅ Wallet A still has Dark Mode (not affected by Wallet B)
9. **Disconnect**
10. **Reconnect Wallet B**
11. **Verify:**
    - ✅ Wallet B still has Classic theme (separate preferences)

---

### Phase 3: Rapid Changes (Debounce Testing)

**Goal:** Verify debouncing prevents database spam

1. **Connect wallet**
2. **Open System Preferences**
3. **Rapidly change window opacity slider** (drag back and forth quickly for 5 seconds)
4. **Stop and wait 2 seconds**
5. **Check browser console:**
   - Should see only ONE "Preferences saved successfully" message
   - Should NOT see dozens of save messages

6. **Rapidly click different themes** (click 5 different themes quickly)
7. **Wait 2 seconds**
8. **Check console:**
   - Should see immediate theme changes
   - Should see consolidated save operation

✅ **Pass Criteria:** Debouncing works, only 1-2 save operations despite rapid changes

---

### Phase 4: Edge Cases

#### Test A: No Wallet Connected

1. **Without connecting wallet**
2. **Change multiple settings**
3. **Verify:**
   - ✅ Settings change immediately in UI
   - ✅ Console shows: `"No wallet connected - skipping save"`
4. **Refresh page**
5. **Verify:**
   - ✅ Settings reset to defaults (not persisted)

#### Test B: Network Failure Simulation

1. **Connect wallet**
2. **Open browser DevTools → Network tab**
3. **Set throttling to "Offline"**
4. **Change theme**
5. **Wait 2 seconds**
6. **Check console:**
   - Should see error: `"Error saving preferences"`
7. **Set throttling back to "Online"**
8. **Change theme again**
9. **Verify:**
   - ✅ Save succeeds now
   - ✅ Latest change persisted

#### Test C: First-Time User

1. **Connect a brand new wallet** (never connected before)
2. **Check console:**
   - Should see: `"First-time user - using defaults"`
3. **Change settings**
4. **Wait for save**
5. **Refresh**
6. **Verify:**
   - ✅ New settings persisted
   - ✅ User record created in database

---

## Database Verification (Optional)

### Check Database Directly

If you have direct database access (Neon dashboard):

```sql
-- See all users and their themes
SELECT 
  u.wallet_address,
  t.theme_id,
  t.accent_color,
  t.title_bar_style,
  t.window_opacity,
  t.corner_style,
  t.menu_bar_style,
  t.font_size
FROM users u
LEFT JOIN theme_preferences t ON u.wallet_address = t.wallet_address
ORDER BY u.last_login DESC;
```

Expected result:
- All connected wallets listed
- Theme preferences properly saved
- All new columns populated

---

## Troubleshooting

### Problem: Settings don't persist after refresh

**Check:**
1. Is wallet connected? (Settings only persist with wallet)
2. Check console for save errors
3. Verify DATABASE_URL in `.env.local`
4. Check if migration ran successfully

### Problem: Console shows "Failed to save preferences"

**Check:**
1. Database connection (DATABASE_URL correct?)
2. Migration ran? (New columns exist?)
3. Network connectivity
4. Check server logs for detailed error

### Problem: Settings persist but don't restore correctly

**Check:**
1. Browser console for load errors
2. Verify `loadUserPreferences()` ran on wallet connect
3. Check if preferences returned from API are correct
4. Inspect Zustand state after load

### Problem: Migration script fails

**Common issues:**
- Database URL not set
- Connection timeout
- Columns already exist (ignore warnings)
- Permissions issue

**Solution:**
```bash
# Check your DATABASE_URL
echo $DATABASE_URL

# Re-run with verbose output
node scripts/migrate-theme-preferences.js
```

---

## Success Criteria

✅ **All settings change UI immediately**  
✅ **All settings persist with wallet connected**  
✅ **Settings restore on page refresh**  
✅ **Settings restore on wallet reconnect**  
✅ **Different wallets have separate preferences**  
✅ **Debouncing prevents database spam**  
✅ **Graceful degradation without wallet**  
✅ **No console errors during normal use**

---

## Performance Benchmarks

Expected timings:
- **Setting change → UI update:** < 16ms (instant)
- **Setting change → DB save:** 300ms - 1000ms (debounced)
- **Wallet connect → Load preferences:** < 500ms
- **Page refresh → Restore settings:** < 300ms

---

## Reporting Issues

If you find bugs, report with:
1. Which test failed
2. Browser console logs
3. Wallet address (or "no wallet")
4. Steps to reproduce
5. Expected vs actual behavior

---

**Ready to Test?** Start with Phase 1! 🚀

