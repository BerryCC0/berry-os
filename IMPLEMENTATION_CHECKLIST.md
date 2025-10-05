# Phase 6 Implementation Checklist

## ✅ What's Been Implemented

### Core Files Created
- [x] `/lib/persistence.ts` - Business logic layer (400+ lines)
- [x] `/app/api/preferences/load/route.ts` - Load preferences API
- [x] `/app/api/preferences/save/route.ts` - Save preferences API  
- [x] `/app/api/preferences/icons/route.ts` - Fast icon save API
- [x] `/src/OS/lib/useWalletSync.ts` - Wallet sync hook
- [x] `/docs/DATABASE_SCHEMA.sql` - Database schema

### Core Files Modified
- [x] `/src/OS/store/systemStore.ts` - Added preferences state & actions
- [x] `/src/OS/components/Desktop/Desktop.tsx` - Integrated wallet sync
- [x] `/docs/ENV_SETUP.md` - Added Neon setup guide

### Documentation
- [x] `/docs/PHASE_6_README.md` - Complete guide
- [x] `/docs/PHASE_6_IMPLEMENTATION_SUMMARY.md` - Technical details
- [x] `/PHASE_6_QUICK_START.md` - Quick setup guide

---

## 🔧 What YOU Need To Do

### Step 1: Set Up Neon Database ⚠️ REQUIRED

**Create Database:**
1. Go to https://neon.tech
2. Sign up (free tier - no credit card needed)
3. Create new project: "Nouns OS"
4. Select region closest to you
5. Copy connection string

**Configure Environment:**
```bash
# Create/edit .env.local in project root
echo "DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require" >> .env.local
```

**Run Schema:**
1. Open Neon SQL Editor
2. Copy entire contents of `/docs/DATABASE_SCHEMA.sql`
3. Paste and execute
4. Verify 7 tables created:
   - `users`
   - `desktop_icons`
   - `theme_preferences`
   - `window_states`
   - `dock_preferences`
   - `system_preferences`
   - `app_states`

---

### Step 2: Install Dependencies (If Needed)

Check if already installed:
```bash
npm list @neondatabase/serverless
```

If not installed:
```bash
npm install @neondatabase/serverless
```

---

### Step 3: Verify TypeScript Configuration

Check `tsconfig.json` has path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

If missing, the API routes won't find the persistence module.

---

### Step 4: Test the Implementation

**Start Development Server:**
```bash
npm run dev
```

**Manual Test Flow:**

1. **Connect Wallet**
   - Click wallet icon in system tray
   - Connect with any wallet (MetaMask, Rainbow, etc.)
   - Check browser console (F12):
     ```
     ✅ "Wallet connected: 0x..."
     ✅ "First-time user - using defaults" OR "Preferences loaded successfully"
     ```

2. **Drag Desktop Icon**
   - Find any desktop icon (e.g., Finder)
   - Click and drag to new position
   - Release
   - Wait 2 seconds
   - Check console:
     ```
     ✅ "Preferences saved successfully"
     ```

3. **Verify Persistence**
   - Refresh page (Cmd+R or F5)
   - Icon should stay in new position
   - ✅ Success!

4. **Test Wallet Switch**
   - Disconnect wallet
   - Icons reset to defaults
   - Reconnect same wallet
   - Icons restore to saved positions
   - ✅ Success!

---

### Step 5: Verify Database

**Check Neon Dashboard:**
```sql
-- See your wallet
SELECT * FROM users;

-- See saved icon positions
SELECT * FROM desktop_icons;

-- See theme preferences
SELECT * FROM theme_preferences;
```

You should see your wallet address and icon positions!

---

## 🐛 Troubleshooting

### Issue: "Database not configured" error

**Cause:** `DATABASE_URL` not set or incorrect

**Fix:**
```bash
# Verify .env.local exists
ls -la .env.local

# Check content
cat .env.local

# Should see:
# DATABASE_URL=postgresql://...

# Restart dev server
npm run dev
```

---

### Issue: TypeScript can't find '@/lib/persistence'

**Cause:** Path alias not configured

**Fix:**
Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Restart your editor and dev server.

---

### Issue: Icons don't save

**Debugging Steps:**

1. **Check Console**
   ```javascript
   // Open browser console (F12)
   // Look for errors during drag
   ```

2. **Check API Endpoints**
   ```bash
   # In browser console, test API manually:
   fetch('/api/preferences/load?wallet=0x1234').then(r => r.json()).then(console.log)
   ```

3. **Check Database Connection**
   ```bash
   # Verify DATABASE_URL in .env.local
   # Try connecting with psql or another tool
   ```

4. **Check Wallet Connected**
   ```javascript
   // In console:
   // Should show your address or null
   useSystemStore.getState().connectedWallet
   ```

---

### Issue: Linter errors

**Common Linter Errors:**

1. **"Cannot find module '@/lib/persistence'"**
   - Fix: Check tsconfig.json has path alias
   - Restart TypeScript server in VS Code

2. **Type errors in persistence.ts**
   - These should be fixed already
   - If you see any, let me know!

---

## ✅ Success Criteria

You'll know it's working when:

- [ ] Dev server starts without errors
- [ ] Wallet connects successfully
- [ ] Console shows "Wallet connected: 0x..."
- [ ] Dragging icon logs "Preferences saved successfully"
- [ ] Page refresh preserves icon positions
- [ ] Database shows saved data
- [ ] Different wallets have different preferences

---

## 🚀 Deploy to Production

### Vercel Deployment

1. **Add Environment Variable:**
   - Go to Vercel project settings
   - Environment Variables section
   - Add: `DATABASE_URL` = (your Neon connection string)
   - Select: Production, Preview, Development

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Phase 6: User customization & persistence"
   git push origin main
   ```

3. **Verify:**
   - Connect wallet in production
   - Drag icon
   - Check saves to database

---

## 📚 Additional Resources

- **Quick Start:** `/PHASE_6_QUICK_START.md`
- **Full Documentation:** `/docs/PHASE_6_README.md`
- **Technical Summary:** `/docs/PHASE_6_IMPLEMENTATION_SUMMARY.md`
- **Database Schema:** `/docs/DATABASE_SCHEMA.sql`
- **Environment Setup:** `/docs/ENV_SETUP.md`

---

## 🎯 Next Steps After Testing

Once Phase 6 is working:

1. **Phase 6.5:** Theme system UI
2. **Phase 7:** Window state persistence
3. **Phase 8:** Social sharing features
4. **Phase 9:** Performance optimizations

---

## ❓ Need Help?

If you run into issues:

1. Check console for errors
2. Verify `DATABASE_URL` is set
3. Check database has tables
4. Verify wallet is connected
5. Check documentation files above

---

**Status:** ✅ Implementation Complete - Ready for Testing

**Your Action:** Set up Neon database + test the flow!

