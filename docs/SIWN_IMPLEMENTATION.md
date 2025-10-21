# Sign In With Neynar (SIWN) Implementation

## Overview

We've successfully integrated Neynar's official React SDK for authentication in the Mini Apps feature. This replaces the custom OAuth flow with Neynar's battle-tested authentication components.

## Changes Made

### 1. NeynarProvider (`app/lib/Neynar/NeynarProvider.tsx`)

**Before**: Custom context provider with no actual Neynar SDK integration
**After**: Wraps the entire app with `NeynarContextProvider` from `@neynar/react`

```typescript
import { NeynarContextProvider, Theme } from '@neynar/react';

export function NeynarProvider({ children }: NeynarProviderProps) {
  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID,
        defaultTheme: Theme.Light,
      }}
    >
      {children}
    </NeynarContextProvider>
  );
}
```

### 2. useFarcasterAuth Hook (`src/Apps/MiniApps/utils/hooks/useFarcasterAuth.ts`)

**Before**: Manual OAuth flow with popup windows, postMessage, localStorage, etc.
**After**: Simple wrapper around `useNeynarContext()` from the SDK

```typescript
import { useNeynarContext } from '@neynar/react';

export function useFarcasterAuth() {
  const neynarContext = useNeynarContext();
  
  return {
    isAuthenticated: neynarContext?.isAuthenticated ?? false,
    fid: user?.fid ?? null,
    username: user?.username ?? null,
    displayName: user?.display_name ?? null,
    pfpUrl: user?.pfp_url ?? null,
    // ... other fields
  };
}
```

### 3. AuthPrompt Component (`src/Apps/MiniApps/components/AuthPrompt/AuthPrompt.tsx`)

**Before**: Custom button that triggered manual OAuth flow
**After**: Uses `NeynarAuthButton` component from the SDK

```typescript
import { NeynarAuthButton } from '@neynar/react';

export default function AuthPrompt() {
  return (
    <div className={styles.siwnContainer}>
      <NeynarAuthButton />
    </div>
  );
}
```

The SDK button is styled to match Mac OS 8 aesthetic using CSS overrides.

### 4. Removed Manual OAuth Callback (`app/api/auth/neynar/callback/route.ts`)

**Status**: This file is no longer needed as the Neynar SDK handles the OAuth callback internally. However, it's been left in place in case you want to use it for reference or other purposes.

## How It Works Now

1. **App Initialization**: 
   - `NeynarContextProvider` wraps the entire app in `app/layout.tsx`
   - It reads `NEXT_PUBLIC_NEYNAR_CLIENT_ID` from environment variables
   - Sets up the Neynar SDK with proper configuration

2. **Authentication Flow**:
   - User opens Mini Apps
   - Sees `NeynarAuthButton` if not authenticated
   - Clicks button → Neynar SDK handles the entire OAuth flow
   - After successful auth, `useNeynarContext()` automatically updates
   - Mini Apps component detects `isAuthenticated` change and shows the catalog

3. **Sign Out**:
   - Calls `signout()` which clears localStorage and reloads the page
   - Neynar SDK resets to unauthenticated state

## Benefits of Using Neynar SDK

1. **Reliability**: Battle-tested by thousands of Farcaster apps
2. **Automatic Updates**: Neynar maintains the OAuth flow, handles API changes
3. **Better UX**: Optimized popup handling, mobile support, error states
4. **Less Code**: Removed 200+ lines of custom OAuth implementation
5. **Consistency**: Same auth experience across all Farcaster apps

## Testing

To test the SIWN flow:

1. Ensure `NEXT_PUBLIC_NEYNAR_CLIENT_ID` is set in `.env.local`
2. Open Berry OS and launch Mini Apps
3. Click the "Sign in with Farcaster" button (styled as Mac OS 8 button)
4. Complete the Neynar OAuth flow in the popup
5. You should be redirected back and see the Mini Apps catalog
6. Click "Sign Out" in the header to test sign out

## Environment Variables Required

```bash
# .env.local
NEYNAR_API_KEY=your_api_key_here           # Server-side
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id # Client-side
```

Get these from https://neynar.com

## Notes

- The Neynar SDK uses localStorage for session persistence
- Auth tokens expire after 24 hours (managed by Neynar)
- The SDK automatically refreshes tokens when needed
- All API calls to Neynar should still go through your `/api` routes for security

