# Nouns Database Module

Complete database implementation for all Nouns NFTs with historical data, auction information, and settler wallet tracking.

## Overview

This module provides a comprehensive database layer for storing and querying Nouns DAO data, including:

- **Core Noun Data**: Traits, SVG rendering, ownership, delegation
- **Auction History**: Winning bids, settler addresses from Etherscan
- **Ownership Transfers**: Complete transfer history
- **Delegation Events**: Delegation changes over time
- **Vote History**: All votes cast with Nouns

## Architecture

```
app/lib/Nouns/Database/
├── types.ts              # TypeScript interfaces
├── persistence.ts        # Database CRUD operations
├── etherscan.ts          # Etherscan API integration
├── backfill.ts           # Historical data population
├── sync.ts               # Real-time synchronization
├── hooks/                # React hooks for data fetching
│   ├── useNoun.ts
│   ├── useNouns.ts
│   ├── useAuctionHistory.ts
│   └── useOwnershipHistory.ts
└── index.ts              # Module exports
```

## Database Schema

### Tables

1. **nouns** - Core NFT data
   - Traits (background, body, accessory, head, glasses)
   - SVG data for rendering
   - Current owner and delegate
   - Creation metadata

2. **auction_history** - Auction records
   - Winner address and winning bid
   - Settler address (from Etherscan)
   - Timing and transaction data

3. **ownership_history** - Transfer events
   - From/to addresses
   - Transaction metadata

4. **delegation_history** - Delegation events
   - Delegator and delegate addresses
   - Transaction metadata

5. **vote_history** - Voting records
   - Proposal ID and vote support
   - Voter and voting power
   - Optional reason text

6. **sync_state** - Synchronization tracking
   - Last synced block/timestamp per entity type

## Setup

### 1. Database Migration

Run the SQL schema migration:

```bash
psql $DATABASE_URL -f docs/migrations/nouns-database-schema.sql
```

### 2. Environment Variables

Add to `.env.local`:

```env
DATABASE_URL=postgresql://...
ETHERSCAN_API_KEY=FYBQKTA9IF438WAQNVWIR1K33W2HJQ6S8A
CRON_SECRET=your-secret-for-cron-auth
```

### 3. Historical Backfill

Populate the database with existing Nouns:

```bash
npm install cross-fetch @apollo/client

node scripts/backfill-nouns-database.js
```

Options:
- `--start=<id>` - Start from Noun ID (default: 0)
- `--end=<id>` - End at Noun ID (default: latest)
- `--batch=<size>` - Batch size (default: 10)
- `--skip-settlers` - Skip Etherscan settler fetching
- `--dry-run` - Validate without inserting

### 4. Setup Cron Job

Configure Vercel Cron to call `/api/nouns/sync` every 30 minutes:

```json
{
  "crons": [
    {
      "path": "/api/nouns/sync",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

## Usage

### API Routes

#### Fetch Single Noun
```
GET /api/nouns/fetch?id=1
```

Returns complete Noun data with auction, transfers, delegations, and votes.

#### List Nouns (Paginated)
```
GET /api/nouns/list?limit=20&offset=0&owner=0x...
```

Query Parameters:
- `limit` - Results per page (max 100)
- `offset` - Pagination offset
- `owner` - Filter by owner address
- `delegate` - Filter by delegate
- `minId`, `maxId` - ID range filters
- `createdAfter`, `createdBefore` - Timestamp filters

#### Get Settler Info
```
GET /api/nouns/settler?nounId=1
```

Returns auction settler address and details.

#### Statistics
```
GET /api/nouns/stats
```

Returns aggregate statistics (total Nouns, average bid, etc.).

#### Sync (Cron)
```
POST /api/nouns/sync
Authorization: Bearer <CRON_SECRET>
```

Triggers synchronization of new Nouns from subgraph.

### React Hooks

#### useNoun
```typescript
import { useNoun } from '@/app/lib/Nouns/Database/hooks';

function MyComponent() {
  const { noun, isLoading, error, refetch } = useNoun(1);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Noun {noun?.noun.noun_id}</h1>
      <img src={`data:image/svg+xml,${encodeURIComponent(noun?.noun.svg_data)}`} />
    </div>
  );
}
```

#### useNouns
```typescript
import { useNouns } from '@/app/lib/Nouns/Database/hooks';

function NounsList() {
  const { nouns, isLoading, fetchMore, pagination } = useNouns({
    limit: 20,
    filters: { owner: '0x...' }
  });
  
  return (
    <div>
      {nouns.map(noun => (
        <div key={noun.noun_id}>Noun {noun.noun_id}</div>
      ))}
      {pagination.hasMore && (
        <button onClick={fetchMore}>Load More</button>
      )}
    </div>
  );
}
```

#### useAuctionHistory
```typescript
import { useAuctionHistory } from '@/app/lib/Nouns/Database/hooks';

function AuctionInfo({ nounId }: { nounId: number }) {
  const { auction, isLoading } = useAuctionHistory(nounId);
  
  if (!auction) return null;
  
  return (
    <div>
      <p>Winner: {auction.winner_address}</p>
      <p>Bid: {auction.winning_bid_eth} ETH</p>
      <p>Settler: {auction.settler_address}</p>
    </div>
  );
}
```

### Direct Database Access

```typescript
import {
  getNoun,
  getNouns,
  getCompleteNoun,
  getAuctionHistory,
  getNounsStatistics,
} from '@/app/lib/Nouns/Database';

// Fetch single Noun
const noun = await getNoun(1);

// Fetch paginated list
const result = await getNouns(
  { limit: 20, offset: 0 },
  { owner: '0x...' }
);

// Fetch complete Noun data
const complete = await getCompleteNoun(1);

// Get statistics
const stats = await getNounsStatistics();
```

## Etherscan Integration

The module uses Etherscan API to fetch settler addresses:

```typescript
import { getSettlerAddress } from '@/app/lib/Nouns/Database';

const settler = await getSettlerAddress('0xf4cbb2c708b4fc26469aab706be667baf29b6e4017554ee6cdbf8b644de982ae');
// Returns: '0x...' (address that called settleCurrentAndCreateNewAuction)
```

Rate limiting: 5 requests/second (Etherscan free tier).

### Testing Settler Extraction

```bash
node scripts/test-etherscan-settler.js 0xf4cbb2c708b4fc26469aab706be667baf29b6e4017554ee6cdbf8b644de982ae
```

## Synchronization

### How It Works

1. **Initial Backfill**: Historical script populates all existing Nouns
2. **Cron Sync**: Every 30 minutes, checks for new Nouns
3. **Incremental Updates**: Only fetches Nouns created since last sync
4. **Settler Backfill**: Separate process to add settler addresses

### Sync State Tracking

The `sync_state` table tracks the last synced block and timestamp for each entity type:
- `nouns` - New Noun creation
- `transfers` - Ownership changes
- `delegations` - Delegation changes

### Manual Sync

Trigger sync manually:

```bash
curl -X POST https://your-domain.com/api/nouns/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Performance

### Indexes

All tables have optimized indexes for common queries:
- Noun ID lookups
- Owner/delegate filters
- Timestamp range queries
- Block number ranges

### Pagination

All list endpoints support pagination to handle large result sets efficiently.

### Caching Strategy

- Database queries are fast (< 100ms typical)
- No additional caching layer needed
- React hooks handle client-side caching

## Migration from GraphQL

### Before (GraphQL)
```typescript
import { useQuery } from '@apollo/client';
import { NOUN_QUERY } from '@/app/lib/Nouns/Goldsky';

function MyComponent() {
  const { data, loading } = useQuery(NOUN_QUERY, {
    variables: { id: '1' }
  });
}
```

### After (Database)
```typescript
import { useNoun } from '@/app/lib/Nouns/Database/hooks';

function MyComponent() {
  const { noun, isLoading } = useNoun(1);
}
```

### Benefits

1. **Faster**: Direct database queries vs GraphQL resolver chain
2. **Richer Data**: Settler addresses from Etherscan
3. **Offline Capable**: Data persists locally
4. **Cost Effective**: No GraphQL quota limits
5. **Flexible**: Custom queries and aggregations

## Troubleshooting

### Database Connection Issues

Check DATABASE_URL environment variable:
```bash
echo $DATABASE_URL
```

### Sync Not Running

Check sync state:
```bash
curl https://your-domain.com/api/nouns/sync
```

### Missing Settler Addresses

Run settler backfill:
```bash
node scripts/backfill-settlers.js
```

### Linter Errors

Fix TypeScript errors:
```bash
npm run lint
```

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] GraphQL API layer over database
- [ ] Advanced analytics and aggregations
- [ ] Proposal data integration
- [ ] ENS name resolution caching
- [ ] Image CDN integration
- [ ] Full-text search

## Contributing

When adding new features:

1. Update schema in `docs/migrations/`
2. Add TypeScript types to `types.ts`
3. Implement CRUD operations in `persistence.ts`
4. Create React hooks in `hooks/`
5. Add API routes in `app/api/nouns/`
6. Update this README

## License

MIT

