# Phase 6: Quick Start Guide

**🎯 Goal:** Test desktop icon persistence in 5 minutes!

---

## Step 1: Set Up Neon Database (2 minutes)

### Create Database
1. Go to **https://neon.tech**
2. Sign up (free tier - no credit card)
3. Click **"Create Project"**
4. Name it: **"Nouns OS"**
5. Select region: **US East** (or closest to you)
6. Click **Create**

### Get Connection String
1. In Neon dashboard, find **Connection Details**
2. Copy the **Connection String**
3. It looks like: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Add to .env.local
1. Open your project root
2. Create/edit `.env.local`
3. Add this line:
   ```env
   DATABASE_URL=postgresql://[paste_your_connection_string_here]
   ```
4. Save file

### Run Database Schema
1. In Neon dashboard, click **SQL Editor**
2. Open this file: **`docs/DATABASE_SCHEMA.sql`**
3. Copy **entire contents**
4. Paste into Neon SQL Editor
5. Click **Run** (or Ctrl+Enter)
6. You should see: **"7 tables created"**

✅ **Database ready!**

---

## Step 2: Start Development Server (1 minute)

```bash
npm run dev
```

Wait for:
```
✓ Ready on http://localhost:3000
```

Open: **http://localhost:3000**

---

## Step 3: Test Icon Persistence (2 minutes)

### Test Flow

#### ✅ Connect Wallet
1. Look for **wallet icon** in top-right (system tray)
2. Click it
3. Choose any wallet (MetaMask, Rainbow, etc.)
4. Connect

**Check console (F12):**
- Should see: `"Wallet connected: 0x..."`
- Should see: `"First-time user - using defaults"` (if first time)

#### ✅ Drag Desktop Icon
1. Find any **desktop icon** (e.g., "Finder")
2. **Click and drag** to a new position
3. Release

**Check console:**
- Wait 1-2 seconds
- Should see: `"Preferences saved successfully"`

#### ✅ Verify Persistence
1. **Refresh the page** (Cmd+R or F5)
2. Icon should **stay in new position**!

#### ✅ Test Wallet Switch
1. **Disconnect wallet**
   - Click wallet icon
   - Click "Disconnect"
   - Icons **reset to defaults**
2. **Reconnect same wallet**
   - Icons **restore to saved positions**!

---

## Expected Behavior

### ✅ What Should Happen
- **Instant drag:** No lag when dragging
- **Auto-save:** Saves 1 second after drag ends
- **Persist on reload:** Position saved across page reloads
- **Wallet-specific:** Different wallets = different positions
- **Reset on disconnect:** Icons return to defaults

### ❌ If Something's Wrong

**Icons don't save:**
- Check console for errors
- Verify `DATABASE_URL` is in `.env.local`
- Restart dev server
- Check Neon dashboard (SQL Editor) → Run: `SELECT * FROM desktop_icons;`

**Icons reset on reload:**
- Make sure wallet is connected
- Check console: Should see "Preferences loaded successfully"
- Wait 2 seconds after dragging (debounce)
- Check database has data: `SELECT * FROM desktop_icons;`

**Wallet won't connect:**
- Check `NEXT_PUBLIC_REOWN_PROJECT_ID` in `.env.local`
- See `/docs/ENV_SETUP.md` for wallet setup

---

## Verify in Database

### Check Your Data
1. Go to **Neon dashboard**
2. Open **SQL Editor**
3. Run this query:
   ```sql
   SELECT * FROM users;
   ```
   - Should see your wallet address

4. Run this query:
   ```sql
   SELECT * FROM desktop_icons WHERE wallet_address = 'YOUR_WALLET_ADDRESS';
   ```
   - Should see icon positions

---

## Success Checklist

- [ ] Neon database created
- [ ] Schema executed (7 tables)
- [ ] `DATABASE_URL` in `.env.local`
- [ ] Dev server running
- [ ] Wallet connected
- [ ] Icon dragged to new position
- [ ] Console shows "Preferences saved successfully"
- [ ] Page refreshed → icon stays in place
- [ ] Database shows saved data

✅ **If all checked:** Phase 6 is working perfectly!

---

## Next Steps

### Explore More
- Drag **multiple icons** → all save
- Try **different wallets** → separate preferences
- Check **database tables** → see your data
- Read **`docs/PHASE_6_README.md`** → full documentation

### Build on This
- Phase 6.5: Add **theme system**
- Phase 7: Add **window persistence**
- Phase 8: Add **social sharing**

---

## Quick Links

- **Full Documentation:** `/docs/PHASE_6_README.md`
- **Database Schema:** `/docs/DATABASE_SCHEMA.sql`
- **Implementation Details:** `/docs/PHASE_6_IMPLEMENTATION_SUMMARY.md`
- **Environment Setup:** `/docs/ENV_SETUP.md`
- **Project Overview:** `/claude.md`

---

## Need Help?

### Common Issues

**"Database not configured" error:**
```bash
# Check if .env.local exists
ls -la .env.local

# Restart dev server
npm run dev
```

**Icons don't persist:**
```sql
-- Check if data is saving to database
SELECT * FROM desktop_icons;
```

**Wallet connection fails:**
- See `/docs/ENV_SETUP.md` for Reown setup
- Add `NEXT_PUBLIC_REOWN_PROJECT_ID` to `.env.local`

---

**🎉 That's it! Desktop icon persistence is now working!**

**Time to complete:** ~5 minutes  
**Complexity:** Easy  
**Result:** Wallet-based persistent customization ✨

---

**Berry Team:** Your Mac OS 8 emulator now has persistent user customization! Users can personalize their desktop and it'll remember across sessions. Ready for production testing! 🚀

