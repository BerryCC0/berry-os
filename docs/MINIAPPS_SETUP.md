# Mini Apps Setup Guide

This guide walks you through setting up the Mini Apps feature with Neynar SIWN authentication.

## Prerequisites

1. **Neynar Account**: Sign up at [neynar.com](https://neynar.com)
2. **API Key**: Get your API key from the Neynar Developer Portal

## Step 1: Configure Neynar Developer Portal

Go to the [Neynar Developer Portal](https://dev.neynar.com) and navigate to **Settings**:

### 1. App Name
- Set your app name (e.g., "Berry OS")
- This will be displayed to users during authentication

### 2. Logo URL
- Provide a logo URL (PNG or SVG format)
- Recommended size: 200x200px
- Example: `https://yoursite.com/logo.png`

### 3. Authorized Origins ⚠️ IMPORTANT
Add your application's HTTP origins. These MUST match exactly where your app is hosted:

**For Local Development:**
```
http://localhost:3000
```

**For Production (Vercel):**
```
https://your-app.vercel.app
```

**Important Notes:**
- NO wildcards allowed (e.g., `*.vercel.app` won't work)
- NO IP addresses
- Must include protocol (`http://` or `https://`)
- NO trailing slashes
- Add BOTH local and production URLs (one per line)

### 4. Permissions
Select the permissions your app needs:
- ✅ **Read only** - View user data, casts, etc.
- ✅ **Read and write** - Post casts, likes, recasts on behalf of users

**For Mini Apps, select "Read and write"** (default)

## Step 2: Environment Variables

Create or update your `.env.local` file with:

```env
# Neynar Configuration (required for Mini Apps)
NEYNAR_API_KEY=your_api_key_here
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id_here
```

### Where to find these values:

1. **NEYNAR_API_KEY**: 
   - Go to Neynar Developer Portal → Settings → API Keys
   - Server-side only (no NEXT_PUBLIC prefix)

2. **NEXT_PUBLIC_NEYNAR_CLIENT_ID**:
   - Go to Neynar Developer Portal → Settings → Client ID
   - Client-side (has NEXT_PUBLIC prefix)

## Step 3: Restart Development Server

After adding environment variables:

```bash
# Stop your dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test Authentication

1. Open Berry OS in your browser
2. Launch the "Mini Apps" application
3. Click "Sign in with Neynar"
4. A popup window should open to `https://app.neynar.com/login`
5. Complete the Farcaster authentication flow
6. You should be redirected back and logged in

## Troubleshooting

### "Popup blocked" Error
- Allow popups for your site in browser settings
- Click the popup icon in your browser's address bar

### "Unauthorized origin" Error
- Check that your Authorized Origins in Neynar match EXACTLY
- No trailing slashes
- Include the correct protocol (http/https)
- Restart your dev server after changes

### "Client ID not found" Error
- Verify `NEXT_PUBLIC_NEYNAR_CLIENT_ID` is set in `.env.local`
- Restart your dev server
- Clear browser cache and reload

### Authentication popup closes immediately
- Check browser console for errors
- Verify Neynar API Key and Client ID are correct
- Check that callback URL (`/api/auth/neynar/callback`) is accessible

### Mini App window opens but is blank
- Check that the Mini App URL is valid
- Look for iframe errors in browser console
- Verify the Mini App URL starts with `https://`

## Testing the Full Flow

1. **Sign In**: 
   ```
   Mini Apps → Sign in with Neynar → Complete OAuth flow
   ```

2. **Browse Catalog**:
   ```
   View Mini Apps → Apply filters → Search
   ```

3. **Launch Mini App**:
   ```
   Click "Launch" on any Mini App → New window opens with iframe
   ```

4. **Interact**:
   ```
   Mini App should load in iframe and be fully functional
   ```

## Production Deployment (Vercel)

### 1. Add Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables:

```
NEYNAR_API_KEY = your_api_key_here
NEXT_PUBLIC_NEYNAR_CLIENT_ID = your_client_id_here
```

### 2. Update Neynar Authorized Origins

Add your production URL to Neynar Developer Portal:

```
https://your-app.vercel.app
```

### 3. Redeploy

After updating environment variables in Vercel, trigger a new deployment.

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Server-side secrets** - `NEYNAR_API_KEY` (no NEXT_PUBLIC)
4. **Client-side public** - `NEXT_PUBLIC_NEYNAR_CLIENT_ID` is safe to expose
5. **Validate origins** - Callback route checks message origins

## API Reference

- [Neynar SIWN Documentation](https://docs.neynar.com/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn)
- [Frame Catalog API](https://docs.neynar.com/reference/fetch-frame-catalog)
- [Mini Apps Host Guide](https://docs.neynar.com/docs/app-host-overview)

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Neynar documentation
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Confirm Authorized Origins match your deployment URL

---

**Status**: Ready for production use ✅

**Last Updated**: October 2025

