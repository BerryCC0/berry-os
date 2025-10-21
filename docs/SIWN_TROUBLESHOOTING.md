# SIWN Authentication Troubleshooting Guide

## Current Issue: "Continue with Berry OS" Button Not Working

### What Should Happen:

1. User clicks "Sign in with Neynar"
2. Popup opens to `https://app.neynar.com/login`
3. User authenticates with Farcaster
4. Neynar redirects to `/api/auth/neynar/callback`
5. Callback page shows "Continue with Berry OS" button
6. **User clicks button** → Message sent to main window
7. Main window receives auth data
8. Popup closes automatically
9. User is signed in!

### Debugging Steps:

#### 1. Check Browser Console (Main Window)

Open browser console (F12) in the **main Berry OS window** and look for:

```
Started listening for auth messages...
Received message: neynar-auth-success [origin]
Authentication successful! {fid, username, ...}
```

If you DON'T see these messages, the postMessage isn't reaching the main window.

#### 2. Check Browser Console (Popup Window)

Open console in the **popup window** (callback page) and check:

- Is `window.opener` defined?
- Is `window.opener.closed` false?
- Are there any errors when calling `postMessage`?

#### 3. Test postMessage Manually

In the **popup window console**, try:

```javascript
// Check if opener is available
console.log('Opener exists:', !!window.opener);
console.log('Opener closed:', window.opener?.closed);

// Try to send message manually
window.opener.postMessage({
  type: 'neynar-auth-success',
  data: {
    fid: 123,
    username: 'test',
    displayName: 'Test User',
    pfpUrl: '',
    signerUuid: 'test-uuid',
    token: 'test-token'
  }
}, '*');
```

Then check the **main window console** - you should see the message received.

#### 4. Common Issues & Solutions

**Issue: "Received message: undefined"**
- The message event doesn't have the expected structure
- Check that callback is sending the correct data format

**Issue: No messages received at all**
- Check if popup blocker is blocking communication
- Try disabling browser extensions temporarily
- Check if popup was opened from the correct origin

**Issue: "window.opener is null"**
- Popup might have been redirected through multiple pages
- Try using a different browser
- Check if "Continue with Berry OS" button is actually triggering the function

**Issue: Message received but auth state not updating**
- Check localStorage: `JSON.parse(localStorage.getItem('farcaster_auth'))`
- Look for errors in the `handleMessage` function
- Verify `saveAuthState` is being called

#### 5. Manual Authentication (For Testing)

If SIWN is not working, you can manually set auth state in the console:

```javascript
// In main Berry OS window console
localStorage.setItem('farcaster_auth', JSON.stringify({
  fid: 3621,
  username: 'testuser',
  displayName: 'Test User',
  pfpUrl: '',
  authToken: 'test-token-' + Date.now(),
  expiresAt: Date.now() + (24 * 60 * 60 * 1000)
}));

// Then reload
window.location.reload();
```

### Updated Callback Flow

The callback now:

1. ✅ Sends message immediately on page load
2. ✅ Shows styled "Continue with Berry OS" button
3. ✅ Uses `origin: '*'` to ensure cross-origin messaging works
4. ✅ Has fallback error handling
5. ✅ Logs all actions for debugging

### Testing Checklist

- [ ] Sign out completely (clear localStorage)
- [ ] Click "Sign in with Neynar"
- [ ] Popup opens successfully
- [ ] Complete Farcaster authentication
- [ ] Land on callback page with "Continue" button
- [ ] Open console in BOTH windows (main + popup)
- [ ] Click "Continue with Berry OS"
- [ ] Check console for messages
- [ ] Verify popup closes
- [ ] Verify main window updates with user info

### Debug Logs to Look For

**Main Window Console:**
```
Started listening for auth messages...
Received message: neynar-auth-success http://localhost:3000
Authentication successful! {fid: 3621, username: "..."}
```

**Popup Window Console:**
```
(No errors about window.opener)
(No CORS errors)
```

### Alternative: Check Network Tab

1. Open Network tab (F12 → Network)
2. Go through auth flow
3. Look for the request to `/api/auth/neynar/callback`
4. Check the response - should be HTML with the success page
5. Verify the auth data is embedded in the script

### Quick Test Script

Run this in the **main window console** after clicking sign in:

```javascript
// Monitor all postMessage events
window.addEventListener('message', (event) => {
  console.log('📨 Message received:', {
    type: event.data?.type,
    origin: event.origin,
    data: event.data
  });
}, true);

console.log('✅ Now monitoring all messages...');
```

Then go through the auth flow and watch for messages.

### Expected Data Structure

The callback should send:

```javascript
{
  type: 'neynar-auth-success',
  data: {
    fid: number,
    username: string,
    displayName: string,
    pfpUrl: string,
    signerUuid: string,
    token: string
  }
}
```

### Still Not Working?

1. **Check Neynar Dashboard**: Verify Authorized Origins includes `http://localhost:3000`
2. **Check Environment Variables**: Verify both API key and Client ID are set
3. **Try Different Browser**: Some extensions block postMessage
4. **Check CORS**: Open browser console and look for CORS errors
5. **Verify Callback URL**: Should be `http://localhost:3000/api/auth/neynar/callback`

### Success Indicators

✅ Console shows "Started listening for auth messages..."
✅ Popup opens and loads successfully
✅ Callback page shows "Continue with Berry OS" button
✅ Clicking button logs messages in main window
✅ Auth data is stored in localStorage
✅ Main window updates with username
✅ Popup closes automatically

### Contact for Help

If still stuck:
1. Share console logs from BOTH windows
2. Share Network tab showing callback response
3. Share your Neynar dashboard Authorized Origins config
4. Check if browser extensions are interfering

