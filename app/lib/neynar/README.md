# Neynar Integration

Farcaster integration via Neynar SDK.

## Architecture

### Server-Side Only (`neynarClient.ts`)

The Neynar SDK (`@neynar/nodejs-sdk`) is **server-side only** and uses Node.js APIs.

**Usage:**
- ✅ API routes (`/app/api/**/route.ts`)
- ✅ Server Components
- ✅ Server Actions
- ❌ Client Components (will cause errors)

**Example - API Route:**

```typescript
// app/api/farcaster/user/route.ts
import { neynar } from '@/app/lib/neynar/neynarClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  
  if (!fid) {
    return Response.json({ error: 'FID required' }, { status: 400 });
  }
  
  const users = await neynar.fetchUsers([parseInt(fid)]);
  return Response.json(users);
}
```

**Example - Server Component:**

```typescript
// app/components/FarcasterProfile.tsx (Server Component - no 'use client')
import { neynar } from '@/app/lib/neynar/neynarClient';

export default async function FarcasterProfile({ fid }: { fid: number }) {
  const users = await neynar.fetchUsers([fid]);
  const user = users[0];
  
  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>@{user.username}</p>
    </div>
  );
}
```

### Client-Side (`NeynarProvider.tsx`)

The `NeynarProvider` is a client component that provides a React Context for client-safe Neynar state.

**Usage:**
- ✅ Already wrapped in `app/layout.tsx`
- ✅ Use `useNeynar()` hook in client components
- ⚠️ For data fetching, create API routes instead

**Example - Client Component with API Route:**

```typescript
// app/components/FarcasterUserCard.tsx
'use client';

import { useState, useEffect } from 'react';

export function FarcasterUserCard({ fid }: { fid: number }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/farcaster/user?fid=${fid}`)
      .then(res => res.json())
      .then(data => setUser(data[0]));
  }, [fid]);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>@{user.username}</p>
    </div>
  );
}
```

## Available Functions

### `neynar.fetchUsers(fids, viewerFid?)`

Fetch user data by FID (Farcaster ID).

**Parameters:**
- `fids`: `number[]` - Array of FIDs to fetch
- `viewerFid`: `number` (optional) - FID of the viewer for context

**Returns:** User data array

### `neynar.fetchFeed(fid, feedType?, limit?)`

Fetch feed for a user.

**Parameters:**
- `fid`: `number` - FID of the user
- `feedType`: `'following' | 'filter'` (default: `'following'`)
- `limit`: `number` (default: `25`)

**Returns:** Feed casts array

### `neynar.lookupUser(username, viewerFid?)`

Lookup user by username.

**Parameters:**
- `username`: `string` - Farcaster username
- `viewerFid`: `number` (optional) - FID of the viewer for context

**Returns:** User data

## Environment Variables

### Server-Side (Required for Neynar SDK)

```env
NEYNAR_API_KEY=your_api_key
```

Get your API key at: https://neynar.com

### Client-Side (Optional)

```env
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
```

Used for client-side Neynar features (if needed in the future).

## Quick Start

### 1. Set Environment Variable

Add to `.env.local`:
```env
NEYNAR_API_KEY=your_api_key_here
```

### 2. Create API Route

```typescript
// app/api/farcaster/user/route.ts
import { neynar } from '@/app/lib/neynar/neynarClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  
  const users = await neynar.fetchUsers([parseInt(fid!)]);
  return Response.json(users);
}
```

### 3. Use in Client Component

```typescript
'use client';

import { useState, useEffect } from 'react';

export function MyComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/farcaster/user?fid=3621')
      .then(res => res.json())
      .then(setUser);
  }, []);
  
  return <div>{user?.displayName}</div>;
}
```

## Documentation

- **Neynar Docs:** https://docs.neynar.com
- **API Reference:** https://docs.neynar.com/reference
- **Getting Started:** https://docs.neynar.com/docs/getting-started-with-neynar

## Notes

- ⚠️ The Neynar SDK is **server-only** - don't try to import `neynarClient.ts` in client components
- ✅ Use API routes to expose Neynar data to client components
- ✅ The `server-only` package will throw an error if accidentally imported on client
- ✅ For Mini App features, use `@neynar/react` (already integrated via `MiniAppProvider`)
