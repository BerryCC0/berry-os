# Phase 6 Testing Guide

**Status:** ✅ **READY TO TEST**  
**Database:** ✅ Initialized (7 tables + 4 indexes)  
**Dev Server:** Running on http://localhost:3000

---

## 🎯 What We're Testing

**Phase 6: User Customization & Persistence**
- Wallet-based user identity
- Desktop icon position persistence
- Auto-save on changes
- Auto-load on wallet connect
- Cross-session persistence

---

## ✅ Pre-Test Checklist

All of these are already done:

- [x] DATABASE_URL set in .env.local
- [x] Database tables created (7 tables)
- [x] Database indexes created (4 indexes)
- [x] Dev server running
- [x] All code files in place
- [x] No linter errors

---

## 🧪 Test Flow

### Test 1: First-Time User

**Steps:**
1. Open http://localhost:3000
2. Open browser console (F12 → Console tab)
3. Click wallet icon in system tray (top-right)
4. Connect with any wallet (MetaMask, Rainbow, Coinbase, etc.)

**Expected Results:**
```
✅ Console: "Wallet connected: 0x..."
✅ Console: "First-time user - using defaults"
✅ Desktop icons appear in default positions
✅ No errors in console
```

---

### Test 2: Icon Persistence

**Steps:**
1. Make sure wallet is connected from Test 1
2. Find any desktop icon (Finder, Calculator, etc.)
3. Click and drag icon to a new position
4. Release the icon
5. Wait 2 seconds (for debounced save)

**Expected Results:**
```
✅ Icon moves smoothly (no lag)
✅ Console: "Preferences saved successfully" (after ~1 second)
✅ No errors in console
```

---

### Test 3: Page Refresh

**Steps:**
1. After Test 2, refresh the page (Cmd+R or F5)
2. Wait for page to fully load

**Expected Results:**
```
✅ Wallet automatically reconnects
✅ Console: "Preferences loaded successfully"
✅ Icon is in the SAME position you dragged it to
✅ Not back to default position
```

**🎉 If this works, Phase 6 is working!**

---

### Test 4: Disconnect/Reconnect

**Steps:**
1. Click wallet icon
2. Disconnect wallet
3. Observe desktop icons
4. Reconnect same wallet

**Expected Results:**
```
✅ On disconnect:
   - Console: "Wallet disconnected"
   - Icons reset to DEFAULT positions

✅ On reconnect:
   - Console: "Wallet connected: 0x..."
   - Console: "Preferences loaded successfully"
   - Icons restore to SAVED positions (from Test 2)
```

---

### Test 5: Different Wallet

**Steps:**
1. Disconnect current wallet
2. Connect with a DIFFERENT wallet address
3. Drag an icon to a different position
4. Disconnect
5. Reconnect with FIRST wallet

**Expected Results:**
```
✅ Wallet 1 has its own saved positions
✅ Wallet 2 has different saved positions
✅ Positions don't interfere with each other
✅ Each wallet loads its own preferences
```

---

### Test 6: Multiple Icons

**Steps:**
1. Connect wallet
2. Drag multiple icons (Finder, Calculator, Berry, etc.)
3. Move each to different positions
4. Wait 2 seconds after last drag
5. Refresh page

**Expected Results:**
```
✅ ALL icons save their positions
✅ ALL icons restore on page load
✅ Console: "Preferences saved successfully" after each drag
```

---

### Test 7: Database Verification

**Steps:**
1. After Test 2 or Test 6, run this command:
   ```bash
   npm run db:check
   ```

2. Go to Neon dashboard: https://console.neon.tech
3. Open SQL Editor
4. Run this query (replace with your wallet address):
   ```sql
   SELECT * FROM users WHERE wallet_address = '0xYOUR_ADDRESS';
   SELECT * FROM desktop_icons WHERE wallet_address = '0xYOUR_ADDRESS';
   ```

**Expected Results:**
```
✅ npm run db:check shows all 7 tables exist
✅ Your wallet address appears in users table
✅ desktop_icons table has entries with your icon positions
✅ position_x and position_y match where you dragged the icons
```

---

## 📊 Database Commands

### Check Database Status
```bash
npm run db:check
```
Shows all tables and verifies connection.

### Re-initialize Database (if needed)
```bash
npm run db:init
```
Creates all tables (safe to run multiple times - uses IF NOT EXISTS).

---

## 🐛 Troubleshooting

### Issue: Icons don't save

**Check:**
1. Wallet is connected (check console for "Wallet connected")
2. Wait 2 seconds after dragging (debounced save)
3. Check console for errors
4. Run `npm run db:check` to verify tables exist

**Debug:**
```javascript
// In browser console:
useSystemStore.getState().connectedWallet
// Should show your wallet address

useSystemStore.getState().desktopIcons
// Should show array of icons with positions
```

---

### Issue: Icons reset on refresh

**Possible causes:**
1. Wallet not connected
2. Preferences didn't save (check console for save confirmation)
3. Database connection issue

**Solution:**
```bash
# Check database
npm run db:check

# Check wallet connection in browser console
useSystemStore.getState().connectedWallet
```

---

### Issue: Console shows errors

**Common errors:**

1. **"Database not configured"**
   - DATABASE_URL missing from .env.local
   - Restart dev server

2. **"Failed to load preferences"**
   - Database connection issue
   - Check DATABASE_URL is correct
   - Run `npm run db:check`

3. **"Failed to save preferences"**
   - Database tables might not exist
   - Run `npm run db:init`

---

## ✅ Success Criteria

Phase 6 is working if:

- [x] Wallet connects successfully
- [x] Console shows connection logs
- [x] Icons can be dragged smoothly
- [x] Console shows "Preferences saved successfully"
- [x] Page refresh preserves icon positions
- [x] Disconnect/reconnect restores positions
- [x] Different wallets have different preferences
- [x] Database shows saved data
- [x] No errors in console

---

## 📸 What Success Looks Like

**Console Output (Happy Path):**
```
Wallet connected: 0x1234...5678
First-time user - using defaults
[...drag icon...]
Preferences saved successfully
[...refresh page...]
Wallet connected: 0x1234...5678
Preferences loaded successfully
```

**Database Query Result:**
```sql
SELECT * FROM desktop_icons WHERE wallet_address = '0x1234...5678';

| id | wallet_address | icon_id          | position_x | position_y |
|----|----------------|------------------|------------|------------|
| 1  | 0x1234...5678  | desktop-finder   | 150        | 200        |
| 2  | 0x1234...5678  | desktop-berry    | 150        | 300        |
```

---

## 🎓 Understanding the Flow

```
1. User connects wallet
   ↓
2. useWalletSync detects connection
   ↓
3. systemStore.loadUserPreferences(address)
   ↓
4. API GET /api/preferences/load
   ↓
5. persistence.loadUserPreferences()
   ↓
6. Neon DB query (all 7 tables)
   ↓
7. Apply to systemStore
   ↓
8. Desktop re-renders with saved positions

---

User drags icon
   ↓
Desktop.tsx moveDesktopIcon()
   ↓
systemStore state updates (immediate)
   ↓
saveUserPreferences() called
   ↓
Debounced 1 second
   ↓
API POST /api/preferences/save
   ↓
persistence.saveAllPreferences()
   ↓
Neon DB UPSERT
   ↓
Success!
```

---

## 🚀 Next Steps After Testing

Once Phase 6 is working:

1. **Deploy to Vercel**
   - Add DATABASE_URL to Vercel env vars
   - Push to GitHub
   - Verify in production

2. **Phase 6.5: Theme System**
   - Add theme selector UI
   - Multiple built-in themes
   - Custom theme creator

3. **Phase 7: Window Persistence**
   - Remember window positions
   - Save window sizes
   - Restore on connect

4. **Phase 8: Social Features**
   - Share desktop setups
   - Theme marketplace
   - Featured desktops

---

## 📞 Need Help?

If tests fail:
1. Check console for specific errors
2. Run `npm run db:check`
3. Verify wallet is connected
4. Check DATABASE_URL in .env.local
5. Review docs in `/docs/PHASE_6_README.md`

---

**Ready to test?** Open http://localhost:3000 and connect your wallet! 🎉

