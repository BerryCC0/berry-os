# Environment Variables Setup

To enable full Web3, Farcaster, and Mini App functionality, create a `.env.local` file in the project root with the following variables:

## Required Environment Variables

### 1. Reown Appkit Project ID (REQUIRED)
**What it's for:** Wallet connection (EVM + Solana + Bitcoin)  
**Get it at:** https://cloud.reown.com

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

⚠️ **Without this:** Wallet connection will not work. You'll see "YOUR_PROJECT_ID_HERE" errors.

---

### 2. Neynar Configuration (OPTIONAL - Recommended for Farcaster)
**What it's for:** Farcaster user data, casts, social features, Mini App functionality  
**Get it at:** https://neynar.com

```env
# Neynar API Key (for server-side operations)
NEYNAR_API_KEY=your_neynar_api_key_here

# Neynar Client ID (for client-side/Mini App)
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id_here

# Farcaster Developer Mnemonic (for creating managed signers)
FARCASTER_DEVELOPER_MNEMONIC="your twelve word mnemonic phrase here"
```

ℹ️ **Without this:** Farcaster data features and Mini App signing won't work.

---

### 3. Database URL (OPTIONAL - For Phase 6)
**What it's for:** User preferences and customization persistence  
**Get it at:** https://neon.tech (recommended) or any PostgreSQL provider

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

ℹ️ **Without this:** App works fine, but user customizations won't persist across sessions.

---

## Optional Environment Variables

### Custom RPC Endpoints (Advanced)
Override default RPC endpoints for better performance or rate limits:

```env
# Ethereum Mainnet
NEXT_PUBLIC_MAINNET_RPC_URL=https://your-ethereum-rpc.com

# Base
NEXT_PUBLIC_BASE_RPC_URL=https://your-base-rpc.com

# Optimism
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://your-optimism-rpc.com

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-solana-rpc.com
```

ℹ️ **Default behavior:** App uses public RPC endpoints if not specified.

---

### Analytics (Pre-configured)
Vercel Analytics is automatically enabled in production. No setup needed.

```env
# Vercel handles this automatically
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto
```

---

## Complete .env.local Template

Create a `.env.local` file in your project root and add:

```env
# ==================== REQUIRED ====================

# Reown Appkit (Wallet Connect)
# Get at: https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here


# ==================== OPTIONAL ====================

# Neynar (Farcaster Integration)
# Get at: https://neynar.com
NEYNAR_API_KEY=your_neynar_api_key_here
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id_here
FARCASTER_DEVELOPER_MNEMONIC="your twelve word mnemonic phrase here"

# Database (User Preferences)
# Get at: https://neon.tech
DATABASE_URL=postgresql://user:password@host/database?sslmode=require


# ==================== ADVANCED (Optional) ====================

# Custom RPC Endpoints
# NEXT_PUBLIC_MAINNET_RPC_URL=
# NEXT_PUBLIC_BASE_RPC_URL=
# NEXT_PUBLIC_OPTIMISM_RPC_URL=
# NEXT_PUBLIC_SOLANA_RPC_URL=
```

---

## Quick Setup Steps

### Minimum Setup (Wallet Connection Only):

1. **Create `.env.local`** in project root
2. **Get Reown Project ID:**
   - Go to https://cloud.reown.com
   - Sign up / Log in
   - Click "Create Project"
   - Copy the Project ID
3. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=paste_your_id_here
   ```
4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Full Setup (All Features):

1. **Reown Project ID** (see above)
2. **Neynar Configuration:**
   - Go to https://neynar.com
   - Sign up / Log in
   - Navigate to Dashboard → API Keys
   - Get your API Key, Client ID, and Developer Mnemonic
   - Add to `.env.local`:
     ```env
     NEYNAR_API_KEY=paste_your_api_key_here
     NEXT_PUBLIC_NEYNAR_CLIENT_ID=paste_your_client_id_here
     FARCASTER_DEVELOPER_MNEMONIC="paste your twelve word phrase here"
     ```

3. **Database (Optional):**
   - Go to https://neon.tech
   - Create free account
   - Create new project
   - Copy connection string
   - Add to `.env.local`:
     ```env
     DATABASE_URL=postgresql://...
     ```

---

## Verification

### Check if environment variables are loaded:

```bash
# In your terminal
echo $NEXT_PUBLIC_REOWN_PROJECT_ID
```

### Check in browser console:

```javascript
// Should NOT show the placeholder
console.log(process.env.NEXT_PUBLIC_REOWN_PROJECT_ID);
```

### Run the app:

```bash
npm run dev
```

**Expected console output:**
- ✅ No "YOUR_PROJECT_ID_HERE" warnings
- ✅ Wallet connection button works
- ⚠️ "NEYNAR_API_KEY not found" warning is OK if you skipped it

---

## Troubleshooting

### "YOUR_PROJECT_ID_HERE" Error
- ❌ Problem: Reown Project ID not set
- ✅ Solution: Add `NEXT_PUBLIC_REOWN_PROJECT_ID` to `.env.local`
- ⚠️ Remember: Must start with `NEXT_PUBLIC_` to work in browser

### Wallet Connection Not Working
1. Check `.env.local` exists in project root (not in `/app` or `/src`)
2. Verify Project ID is correct (no quotes, no spaces)
3. Restart dev server after adding env vars
4. Clear browser cache and reload

### Neynar Features Not Working
- Check that you have all three Neynar env vars set:
  - `NEYNAR_API_KEY` (no NEXT_PUBLIC prefix)
  - `NEXT_PUBLIC_NEYNAR_CLIENT_ID` (with NEXT_PUBLIC prefix)
  - `FARCASTER_DEVELOPER_MNEMONIC` (in quotes)
- Verify keys are active at https://neynar.com
- Ensure mnemonic is wrapped in quotes

### Database Connection Issues
- Verify connection string format
- Check if database allows connections from your IP
- Test connection string with `psql` or another tool

---

## Security Notes

### ✅ Safe to Commit:
- `.env.local.example` (template file)
- `docs/ENV_SETUP.md` (this file)

### ❌ NEVER Commit:
- `.env.local` (contains your actual keys)
- `.env` (same as above)

These files are already in `.gitignore`.

### Public vs Private Keys:
Variables with `NEXT_PUBLIC_` prefix are exposed in the browser. This is intentional and safe for:
- Reown Project ID (designed to be public)
- Neynar Client ID (public read operations)

Variables WITHOUT `NEXT_PUBLIC_` are server-side only and more secure:
- Neynar API Key (for backend operations)
- Farcaster Developer Mnemonic (for signing operations)

Do NOT use `NEXT_PUBLIC_` for:
- Database credentials
- Private API keys
- Secret tokens

---

## For Production (Vercel)

When deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - Value: `your_project_id`
   - Environments: Production, Preview, Development

4. Redeploy your app

Vercel encrypts and securely stores your environment variables.

---

## Need Help?

- Reown Setup: https://docs.reown.com/appkit/overview
- Neynar Docs: https://docs.neynar.com
- Neon Database: https://neon.tech/docs

---

**Note:** The app will work without optional env vars, but with limited functionality. At minimum, set up the Reown Project ID for wallet connection.
