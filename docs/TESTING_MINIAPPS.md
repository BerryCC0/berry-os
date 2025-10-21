# Testing Mini Apps - Quick Reference

## Clear Authentication (When Needed)

If you need to clear your authentication state to test the sign-in flow again, you have several options:

### Option 1: Use the Sign Out Button
After signing in, you'll see a **"Sign Out"** button next to your username in the Mini Apps header. Click it to sign out.

### Option 2: Browser Console (Manual Clear)
Open the browser console (F12) and run:

```javascript
// Clear Farcaster auth
localStorage.removeItem('farcaster_auth');

// Then reload the page
window.location.reload();
```

### Option 3: Clear All localStorage
To completely reset all Berry OS data:

```javascript
localStorage.clear();
window.location.reload();
```

## Testing the Authentication Flow

### Test with Real Neynar (Recommended)

1. **Setup** (if not already done):
   - Add your environment variables to `.env.local`:
     ```env
     NEYNAR_API_KEY=your_api_key
     NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
     ```
   - Configure Authorized Origins in Neynar Developer Portal:
     ```
     http://localhost:3000
     ```
   - Restart dev server: `npm run dev`

2. **Test Sign In**:
   - Open Berry OS
   - Launch "Mini Apps"
   - Click "Sign in with Neynar"
   - Popup opens to `https://app.neynar.com/login`
   - Sign in with your Farcaster account
   - Approve permissions
   - You're redirected back and signed in!

3. **Verify**:
   - Check that your Farcaster username appears in the header
   - Mini Apps catalog should load
   - "Sign Out" button should be visible

4. **Test Sign Out**:
   - Click "Sign Out" button
   - Should return to auth screen
   - LocalStorage should be cleared

### Check Configuration Status

Visit this URL to verify your setup:
```
http://localhost:3000/api/auth/neynar/status
```

Expected response:
```json
{
  "configured": {
    "apiKey": true,
    "clientId": true
  },
  "preview": {
    "apiKey": "12345678...abcd",
    "clientId": "00b75745...xxxx"
  }
}
```

## Testing Mini App Launching

### Test Flow:
1. Sign in with Neynar
2. Browse the catalog
3. Click "Launch" on any Mini App
4. New window should open
5. Mini App iframe should load with splash screen
6. Mini App should become interactive

### Check Console for Errors:
Open browser console (F12) to see:
- Authentication messages
- Mini App loading status
- Any iframe errors
- SDK message passing (if implemented)

### Common Issues:

**"Popup blocked"**
- Solution: Allow popups in browser settings
- Click the popup icon in address bar

**"No Mini App URL provided"**
- This means the launch data wasn't passed correctly
- Check browser console for errors
- Verify `launchMiniApp` function is working

**Iframe won't load**
- Check that Mini App URL is HTTPS
- Look for CORS or security errors in console
- Some Mini Apps may have restrictions on iframe embedding

## Testing Filters and Search

### Test Filters:
- Click different categories → Grid updates
- Click different networks → Grid updates
- Change time window → Trending updates
- Click "Clear All Filters" → Resets to all apps

### Test Search:
- Type app name → Filters results
- Type author username → Shows their apps
- Type keyword → Searches descriptions
- Clear search → Shows all apps

### Test Load More:
- Scroll to bottom
- Click "Load More" button
- More apps should append to grid
- Button should disappear when no more results

## Performance Testing

### Check Loading States:
- Initial load shows skeleton cards
- "Loading more..." appears during pagination
- Splash screen appears when launching Mini App

### Check Error States:
- Network error → Shows error message
- Invalid configuration → Shows configuration prompt
- Failed Mini App load → Shows error in iframe

## Mobile Testing

### Responsive Design:
- Resize browser window
- Grid should adjust columns (4 → 3 → 2 → 1)
- Filters should stack nicely
- Sign out button should remain accessible

### Touch Testing (on mobile device):
- Tap to launch apps
- Scroll through catalog
- Filters should be touch-friendly
- Sign in popup works on mobile

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Mac)
- ✅ Mobile browsers (iOS Safari, Chrome)

## Debugging Tips

### Enable Verbose Logging:
Check browser console for:
- `"Sign-in success with data:"` - Authentication succeeded
- `"Mini App SDK message:"` - Mini App is communicating
- `"TODO: Implement actual SIWN"` - Using placeholder auth (should NOT appear with real Neynar setup)

### Check Network Tab:
- `/api/miniapps/catalog` - Should return frames array
- `/api/auth/neynar/callback` - Should handle OAuth callback
- Mini App iframe URL - Should load successfully

### Verify LocalStorage:
Open browser console and run:
```javascript
// Check auth state
JSON.parse(localStorage.getItem('farcaster_auth') || '{}')

// Should show:
// {
//   fid: number,
//   username: string,
//   displayName: string,
//   pfpUrl: string,
//   authToken: string,
//   expiresAt: timestamp
// }
```

## Quick Reset Commands

```javascript
// Clear only Mini Apps auth
localStorage.removeItem('farcaster_auth');

// Clear all Berry OS data
localStorage.clear();

// Force reload
window.location.reload();

// Check if configured
fetch('/api/auth/neynar/status').then(r => r.json()).then(console.log);
```

## Production Testing (Vercel)

After deploying to production:

1. **Update Neynar Settings**:
   - Add production URL to Authorized Origins:
     ```
     https://your-app.vercel.app
     ```

2. **Verify Environment Variables**:
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure both `NEYNAR_API_KEY` and `NEXT_PUBLIC_NEYNAR_CLIENT_ID` are set

3. **Test Flow**:
   - Visit your production URL
   - Test sign-in flow
   - Verify OAuth callback works
   - Test Mini App launching

4. **Check Logs**:
   - Vercel dashboard → Deployments → Your deployment → Logs
   - Look for any errors in server logs

## Reporting Issues

When reporting issues, include:
- Browser and version
- Error messages from console
- Network tab showing failed requests
- Steps to reproduce
- Screenshot if applicable

---

**Quick Links:**
- [Full Setup Guide](./MINIAPPS_SETUP.md)
- [Neynar Dashboard](https://dev.neynar.com)
- [Neynar SIWN Docs](https://docs.neynar.com/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-neynar-siwn)

