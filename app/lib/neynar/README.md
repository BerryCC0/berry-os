# Neynar Integration

Basic Farcaster integration using [Neynar SDK](https://docs.neynar.com/docs/getting-started-with-neynar).

## Setup

Add your Neynar API key to `.env.local`:

```env
NEYNAR_API_KEY=your_api_key_here
```

Get your API key at: https://neynar.com

## Usage

### In Server Components or API Routes

```typescript
import { neynar, neynarClient } from '@/app/lib/neynar/neynarClient';

// Fetch user data
const users = await neynar.fetchUsers([2, 3], viewerFid);

// Fetch user feed
const feed = await neynar.fetchFeed(3, 'following', 25);

// Lookup user by username
const user = await neynar.lookupUser('dwr.eth');

// Or use the client directly for full API access
const response = await neynarClient.fetchBulkUsers({ 
  fids: [2, 3],
  viewerFid: 6131 
});
```

### In Client Components

```typescript
'use client';

import { useNeynar } from '@/app/lib/neynar/NeynarProvider';

function MyComponent() {
  const { neynar, client, isConfigured } = useNeynar();
  
  const loadUser = async () => {
    if (!isConfigured) {
      console.warn('Neynar not configured');
      return;
    }
    
    const users = await neynar.fetchUsers([3]);
    console.log(users);
  };
  
  return <button onClick={loadUser}>Load User</button>;
}
```

## Available Functions

### `neynar.fetchUsers(fids, viewerFid?)`
Fetch user profile data by FIDs.

**Example:**
```typescript
const users = await neynar.fetchUsers([2, 3], 6131);
// Returns: { users: [{ fid, username, display_name, ... }] }
```

### `neynar.fetchFeed(fid, feedType?, limit?)`
Fetch a user's Farcaster feed.

**Example:**
```typescript
const feed = await neynar.fetchFeed(3, 'following', 50);
// Returns: { casts: [{ hash, author, text, ... }] }
```

### `neynar.lookupUser(username, viewerFid?)`
Look up a user by username.

**Example:**
```typescript
const user = await neynar.lookupUser('dwr.eth');
// Returns: { result: { user: { fid, username, ... } } }
```

## Core Concepts

- **FID**: Farcaster ID - unique identifier for each user
- **Cast**: Farcaster post (like a tweet)
- **Feed**: Collection of casts from users you follow
- **Username**: Human-readable identifier (e.g., 'dwr.eth')

## Documentation

- Full Neynar API Reference: https://docs.neynar.com/reference
- Getting Started Guide: https://docs.neynar.com/docs/getting-started-with-neynar
- Neynar SDK: https://github.com/neynarxyz/nodejs-sdk

