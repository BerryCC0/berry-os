# User Profile Fetching Fix

## Problem

After signing in with Neynar's `NeynarAuthButton`, the user account button wasn't appearing in the Mini Apps header. The console logs revealed:

```javascript
Neynar Context: {
  isAuthenticated: true,
  user: { signer_uuid: "9ce51ae3-6772-45d6-b438-17e8eb72ba72" }
}

MiniApps auth state: {
  isAuthenticated: true,
  fid: null,
  username: null,
  displayName: null,
  pfpUrl: null
}
```

The Neynar SDK's authentication only provides a `signer_uuid`, but not the full user profile data (username, FID, display name, profile picture).

## Solution

We implemented a two-step authentication flow:

### 1. Updated `useFarcasterAuth` Hook

**File**: `src/Apps/MiniApps/utils/hooks/useFarcasterAuth.ts`

The hook now:
- Detects when a user is authenticated with a signer UUID
- Automatically fetches the complete user profile from our backend API
- Stores the profile data in local state
- Returns the full user information to consuming components

```typescript
// Key changes:
const [userProfile, setUserProfile] = useState<NeynarUser | null>(null);
const signerUuid = neynarContext?.user?.signer_uuid;

useEffect(() => {
  if (!isAuthenticated || !signerUuid || userProfile) return;
  
  async function fetchUserProfile() {
    const response = await fetch(`/api/auth/neynar/user?signer_uuid=${signerUuid}`);
    if (response.ok) {
      const data = await response.json();
      setUserProfile(data);
    }
  }
  
  fetchUserProfile();
}, [isAuthenticated, signerUuid, userProfile]);
```

### 2. Created User Profile API Route

**File**: `app/api/auth/neynar/user/route.ts`

This server-side API route:
- Accepts a `signer_uuid` query parameter
- Calls Neynar's `lookupSigner()` to get the FID associated with the signer
- Calls Neynar's `fetchBulkUsers()` to get the full user profile
- Returns the complete user data:
  ```typescript
  {
    fid: number,
    username: string,
    display_name: string,
    pfp_url: string,
    signer_uuid: string
  }
  ```

### 3. Updated MiniApps Component

**File**: `src/Apps/MiniApps/MiniApps.tsx`

The component now:
- Shows the user button when `isAuthenticated` is true (not dependent on username)
- Provides fallbacks for missing data (`'User'` as default display name)
- Shows a placeholder avatar (👤) if profile picture isn't loaded yet
- Gracefully handles the loading state while profile is fetching

## Flow Diagram

```
1. User clicks "Sign in with Farcaster" (NeynarAuthButton)
   ↓
2. Neynar SDK handles OAuth flow
   ↓
3. NeynarContext updates: { isAuthenticated: true, user: { signer_uuid: "..." } }
   ↓
4. useFarcasterAuth detects signer_uuid
   ↓
5. Fetches /api/auth/neynar/user?signer_uuid=...
   ↓
6. API calls neynarClient.lookupSigner({ signerUuid })
   ↓
7. API gets FID from signer
   ↓
8. API calls neynarClient.fetchBulkUsers({ fids: [fid] })
   ↓
9. API returns complete user profile
   ↓
10. useFarcasterAuth updates state with profile data
    ↓
11. MiniApps component re-renders with user button showing username, FID, and avatar
```

## Testing

To verify the fix works:

1. Open Mini Apps
2. Click "Sign in with Farcaster"
3. Complete the authentication
4. Check browser console for:
   - "Fetched user profile:" log with full user data
   - User button should appear in top right with your profile picture and username
5. Click the user button to see dropdown with:
   - Display name
   - @username
   - FID
   - "View on Warpcast" link
   - "Sign Out" button

## Benefits

- ✅ User sees their profile immediately after authentication
- ✅ No manual refresh required
- ✅ Graceful loading state with fallbacks
- ✅ Secure server-side API calls (API key not exposed)
- ✅ Reusable pattern for other Neynar auth flows

